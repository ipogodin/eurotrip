import { MAX_PER_VILLA, VOTE_BUDGET } from '$lib/config/voting.js';

/**
 * Pure voting rules, shared by the server (authoritative) and the UI
 * (convenience). No server-only imports.
 *
 * @typedef {Record<string, number>} Ballot  villaId -> points (1..MAX_PER_VILLA)
 * @typedef {'open' | 'closed' | 'decided'} VotingState
 */

/**
 * @param {string | null | undefined} override  admin-set deadline (ISO) or null
 * @param {string} fallback
 * @returns {string}
 */
export function effectiveDeadline(override, fallback) {
	return override || fallback;
}

/**
 * @param {number} now ms epoch
 * @param {string} deadline ISO
 * @param {string | null | undefined} winnerId
 * @returns {VotingState}
 */
export function votingState(now, deadline, winnerId) {
	if (winnerId) return 'decided';
	return now >= Date.parse(deadline) ? 'closed' : 'open';
}

/**
 * @param {Ballot} ballot
 * @returns {number}
 */
export function spent(ballot) {
	return Object.values(ballot).reduce((sum, n) => sum + n, 0);
}

/**
 * A copy of the ballot without points for villas that aren't on the list (any
 * more). Points on a removed villa must never count against the member.
 * @param {Ballot} ballot
 * @param {Iterable<string>} villaIds  the villas that are on the list
 * @returns {Ballot}
 */
export function pruneBallot(ballot, villaIds) {
	const keep = new Set(villaIds);
	return Object.fromEntries(Object.entries(ballot).filter(([id]) => keep.has(id)));
}

/**
 * Whether one more point can go to this villa right now.
 * @param {Ballot} ballot
 * @param {string} villaId
 * @param {{ budget?: number, max?: number }} [limits]
 */
export function canIncrement(ballot, villaId, { budget = VOTE_BUDGET, max = MAX_PER_VILLA } = {}) {
	return (ballot[villaId] ?? 0) < max && spent(ballot) < budget;
}

/**
 * A copy of the ballot with this villa set to `points` (0 removes it).
 * @param {Ballot} ballot
 * @param {string} villaId
 * @param {number} points
 * @returns {Ballot}
 */
export function withPoints(ballot, villaId, points) {
	const next = { ...ballot };
	if (points <= 0) delete next[villaId];
	else next[villaId] = points;
	return next;
}

/**
 * Validate a submitted ballot. The server must call this on every save.
 * Zeros are dropped from the cleaned ballot. `budget` is this member's own
 * budget. `previousSpent` (what their saved ballot uses now) lets someone
 * whose budget was lowered after voting step back down point by point:
 * an over-budget ballot is accepted only if it spends less than before.
 * @param {unknown} input
 * @param {{ villaIds: string[], state: VotingState, budget?: number, max?: number, previousSpent?: number }} ctx
 * @returns {{ ok: true, ballot: Ballot } | { ok: false, code: string, error: string }}
 */
export function validateBallot(input, ctx) {
	const { villaIds, state, budget = VOTE_BUDGET, max = MAX_PER_VILLA, previousSpent = 0 } = ctx;
	if (state === 'decided') {
		return { ok: false, code: 'decided', error: 'A winner has been picked. Voting is over.' };
	}
	if (state === 'closed') {
		return { ok: false, code: 'closed', error: 'Voting has closed.' };
	}
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		return { ok: false, code: 'shape', error: 'Invalid ballot.' };
	}

	const known = new Set(villaIds);
	/** @type {Ballot} */
	const clean = {};
	for (const [villaId, points] of Object.entries(input)) {
		if (!known.has(villaId)) {
			return { ok: false, code: 'unknown-villa', error: 'That villa is not on the list.' };
		}
		if (typeof points !== 'number' || !Number.isInteger(points) || points < 0 || points > max) {
			return {
				ok: false,
				code: 'points',
				error: `Each villa takes 0 to ${max} points.`
			};
		}
		if (points > 0) clean[villaId] = points;
	}
	const total = spent(clean);
	if (total > budget && total >= previousSpent) {
		return { ok: false, code: 'budget', error: `You only have ${budget} points in total.` };
	}
	return { ok: true, ballot: clean };
}

/**
 * Results for the three views.
 * @param {Record<string, Ballot>} ballots  memberId -> ballot
 * @param {{ id: string, name: string }[]} villas
 * @param {{ id: string, votes?: number }[]} members  in display order; `votes` = own budget
 * @param {{ budget?: number }} [limits]
 * @returns {{
 *   byVilla: { villaId: string, total: number, rank: number | null,
 *              voters: { memberId: string, points: number }[] }[],
 *   byPerson: { memberId: string, spent: number, left: number,
 *               picks: { villaId: string, points: number }[] }[],
 *   notVotedYet: string[]
 * }}
 */
export function tally(ballots, villas, members, { budget = VOTE_BUDGET } = {}) {
	const villaIds = new Set(villas.map((v) => v.id));

	const byPerson = members.map((m) => {
		const picks = Object.entries(ballots[m.id] ?? {})
			.filter(([villaId, points]) => villaIds.has(villaId) && points > 0)
			.map(([villaId, points]) => ({ villaId, points }))
			.sort((a, b) => b.points - a.points);
		const used = picks.reduce((sum, p) => sum + p.points, 0);
		return { memberId: m.id, spent: used, left: Math.max(0, (m.votes ?? budget) - used), picks };
	});

	const unsorted = villas.map((v) => {
		const voters = byPerson
			.map((p) => ({
				memberId: p.memberId,
				points: p.picks.find((x) => x.villaId === v.id)?.points ?? 0
			}))
			.filter((x) => x.points > 0)
			.sort((a, b) => b.points - a.points);
		return { villa: v, total: voters.reduce((sum, x) => sum + x.points, 0), voters };
	});
	unsorted.sort((a, b) => b.total - a.total || a.villa.name.localeCompare(b.villa.name));

	/** Equal totals share a rank (1, 2, 2, 4); villas with no votes are unranked. */
	const byVilla = unsorted.map((row) => {
		const firstWithTotal = unsorted.findIndex((r) => r.total === row.total);
		return {
			villaId: row.villa.id,
			total: row.total,
			rank: row.total > 0 ? firstWithTotal + 1 : null,
			voters: row.voters
		};
	});

	return {
		byVilla,
		byPerson,
		notVotedYet: byPerson.filter((p) => p.spent === 0).map((p) => p.memberId)
	};
}
