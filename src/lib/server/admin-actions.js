import { DEFAULT_DEADLINE } from '../config/voting.js';
import { effectiveDeadline, votingState } from '../voting.js';

/**
 * What the admin can do. Plain functions that take the store (no SvelteKit
 * imports), so every rule is unit-tested against the in-memory store. The
 * route handlers only check `requireAdmin` and call these.
 *
 * @typedef {import('./store/types.js').Store} Store
 * @typedef {{ ok: true, message: string } | { ok: false, error: string }} Outcome
 */

/** Longest the deadline may be pushed out: a typo like year 2062 is almost surely a mistake. */
const MAX_DEADLINE_DAYS = 120;
/** Voting between fewer than two villas makes no sense. */
export const MIN_VILLAS = 2;

/**
 * @param {Store} store
 * @param {number} now ms epoch
 */
export async function currentStatus(store, now) {
	const [voting, trip] = await Promise.all([store.getVoting(), store.getTrip()]);
	const deadline = effectiveDeadline(voting.deadline, DEFAULT_DEADLINE);
	return {
		deadline,
		removed: voting.removed,
		resetAt: voting.resetAt,
		winnerId: trip.winnerId,
		state: votingState(now, deadline, trip.winnerId)
	};
}

/**
 * Set a new closing time. Works to extend an open vote and to reopen a
 * closed one; not while a winner is picked (undo that first).
 * @param {Store} store
 * @param {string} deadlineIso  UTC ISO
 * @param {number} now
 * @returns {Promise<Outcome>}
 */
export async function setDeadline(store, deadlineIso, now) {
	const t = Date.parse(deadlineIso);
	if (!Number.isFinite(t)) return { ok: false, error: 'That is not a valid date and time.' };
	if (t <= now) return { ok: false, error: 'Pick a time in the future.' };
	if (t > now + MAX_DEADLINE_DAYS * 86_400_000) {
		return { ok: false, error: `Pick a time within ${MAX_DEADLINE_DAYS} days.` };
	}
	const { state } = await currentStatus(store, now);
	if (state === 'decided') {
		return {
			ok: false,
			error: 'A winner is picked. Undo the winner before changing the deadline.'
		};
	}
	await store.setVoting({ deadline: new Date(t).toISOString() });
	return { ok: true, message: state === 'closed' ? 'Voting is open again.' : 'Deadline updated.' };
}

/**
 * Close voting right now (people keep their votes, nobody can change them).
 * @param {Store} store
 * @param {number} now
 * @returns {Promise<Outcome>}
 */
export async function closeNow(store, now) {
	const { state } = await currentStatus(store, now);
	if (state !== 'open') return { ok: false, error: 'Voting is not open.' };
	await store.setVoting({ deadline: new Date(now).toISOString() });
	return { ok: true, message: 'Voting is closed.' };
}

/**
 * Pick the winning villa. This also ends voting.
 * @param {Store} store
 * @param {string} villaId
 * @param {string[]} activeIds  villas currently on the list
 * @param {number} now
 * @returns {Promise<Outcome>}
 */
export async function pickWinner(store, villaId, activeIds, now) {
	if (!activeIds.includes(villaId)) {
		return { ok: false, error: 'That villa is not on the list.' };
	}
	await store.setTrip({ winnerId: villaId, pickedAt: new Date(now).toISOString() });
	return { ok: true, message: 'Winner picked. Voting is over.' };
}

/**
 * Take the winner back; voting returns to open or closed by the deadline.
 * @param {Store} store
 * @param {number} now
 * @returns {Promise<Outcome>}
 */
export async function undoWinner(store, now) {
	const { winnerId } = await currentStatus(store, now);
	if (!winnerId) return { ok: false, error: 'No winner is picked.' };
	await store.setTrip({ winnerId: null, pickedAt: null });
	return { ok: true, message: 'Winner removed. Voting is back to its deadline.' };
}

/**
 * Give everyone all their points back.
 * @param {Store} store
 * @param {string[]} memberIds
 * @param {number} now
 * @returns {Promise<Outcome>}
 */
export async function resetAllVotes(store, memberIds, now) {
	const { state } = await currentStatus(store, now);
	if (state === 'decided') {
		return { ok: false, error: 'A winner is picked. Undo the winner before resetting votes.' };
	}
	await Promise.all(memberIds.map((id) => store.setBallot(id, {})));
	await store.setVoting({ resetAt: new Date(now).toISOString() });
	return { ok: true, message: "Everyone's votes were reset." };
}

/**
 * Take a villa off the list. Its points are deleted from every ballot, which
 * is what gives them back to the voters (their budget is computed from the
 * ballot). Returns who got how many points back.
 * @param {Store} store
 * @param {{ villaId: string, allVillaIds: string[], memberIds: string[], now: number }} ctx
 * @returns {Promise<Outcome & { returned?: { memberId: string, points: number }[] }>}
 */
export async function removeVilla(store, { villaId, allVillaIds, memberIds, now }) {
	if (!allVillaIds.includes(villaId)) return { ok: false, error: 'That villa does not exist.' };
	const { removed, winnerId, state } = await currentStatus(store, now);
	if (removed.includes(villaId)) return { ok: false, error: 'That villa is already removed.' };
	if (winnerId === villaId) {
		return { ok: false, error: 'This villa is the winner. Undo the winner first.' };
	}
	if (state === 'decided') {
		return { ok: false, error: 'A winner is picked. Undo the winner before removing villas.' };
	}
	const left = allVillaIds.filter((id) => id !== villaId && !removed.includes(id));
	if (left.length < MIN_VILLAS) {
		return { ok: false, error: `At least ${MIN_VILLAS} villas must stay on the list.` };
	}

	// List first, then the ballots: if this stops half-way the villa is already
	// hidden, and the page ignores any leftover points on it.
	await store.setVoting({ removed: [...removed, villaId] });
	const ballots = await store.getBallots(memberIds);
	/** @type {{ memberId: string, points: number }[]} */
	const returned = [];
	for (const memberId of memberIds) {
		const ballot = ballots[memberId] ?? {};
		if (!(villaId in ballot)) continue;
		const { [villaId]: points, ...rest } = ballot;
		await store.setBallot(memberId, rest);
		returned.push({ memberId, points });
	}
	const total = returned.reduce((sum, r) => sum + r.points, 0);
	return {
		ok: true,
		returned,
		message: returned.length
			? `Villa removed. ${total} point${total === 1 ? '' : 's'} went back to ${returned.length} ${returned.length === 1 ? 'person' : 'people'}.`
			: 'Villa removed. Nobody had voted for it.'
	};
}

/**
 * Put a removed villa back on the list. Points that were returned stay with
 * their owners; the villa starts again at zero.
 * @param {Store} store
 * @param {string} villaId
 * @returns {Promise<Outcome>}
 */
export async function restoreVilla(store, villaId) {
	const { removed } = await store.getVoting();
	if (!removed.includes(villaId)) return { ok: false, error: 'That villa is not removed.' };
	await store.setVoting({ removed: removed.filter((id) => id !== villaId) });
	return { ok: true, message: 'Villa is back on the list, with no votes.' };
}
