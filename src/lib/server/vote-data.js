import { villas } from '$lib/config/villas.js';
import { DEFAULT_DEADLINE } from '$lib/config/voting.js';
import { effectiveDeadline, pruneBallot, votingState } from '$lib/voting.js';
import { getMembers } from './roster.js';
import { getStore } from './store/index.js';

/** Everyone's public identity + point budget, in roster order. Never phrases. */
export function publicMembers() {
	return getMembers().map(({ id, name, short, votes }) => ({ id, name, short, votes }));
}

/** Current deadline, state and winner, always computed with server time. */
export async function votingStatus() {
	const store = getStore();
	const [voting, trip] = await Promise.all([store.getVoting(), store.getTrip()]);
	const deadline = effectiveDeadline(voting.deadline, DEFAULT_DEADLINE);
	return {
		deadline,
		winnerId: trip.winnerId,
		state: votingState(Date.now(), deadline, trip.winnerId),
		/** Villa ids the admin took off the list. */
		removed: voting.removed,
		/** When the admin last reset everyone's votes (members get a notice). */
		resetAt: voting.resetAt
	};
}

/**
 * The villas people can currently vote for (the config list minus removed ones).
 * @param {string[]} removed
 */
export function activeVillaIds(removed) {
	return villas.map((v) => v.id).filter((id) => !removed.includes(id));
}

/**
 * Everything the vote screens need (the map page and each villa page):
 * who I am, the roster, all ballots, and the voting status. Villa facts come
 * from the config import, not from here.
 * @param {import('$lib/server/members.js').PublicMember} me
 */
export async function loadVoteData(me) {
	const members = publicMembers();
	const [raw, status] = await Promise.all([
		getStore().getBallots(members.map((m) => m.id)),
		votingStatus()
	]);
	// Points on a removed villa never count, even if a removal stopped half-way.
	const keep = activeVillaIds(status.removed);
	const ballots = Object.fromEntries(
		Object.entries(raw).map(([id, b]) => [id, pruneBallot(b, keep)])
	);
	return { me: me.id, members, ballots, ...status };
}
