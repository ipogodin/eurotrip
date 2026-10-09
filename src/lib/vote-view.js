import { MAX_PER_VILLA, VOTE_BUDGET } from '$lib/config/voting.js';
import { canIncrement, tally } from '$lib/voting.js';

/**
 * Turn the raw vote data into what the screens draw: the tally, plus one
 * ready-to-render row per villa. Shared by the map page and the villa pages,
 * so a tap shows up the same way everywhere. `myBallot` includes my unsaved
 * taps; everyone else's ballots come from the server.
 *
 * @param {{
 *   villas: import('$lib/config/villas.js').Villa[],
 *   members: import('$lib/members-ui.js').PublicMember[],
 *   ballots: Record<string, import('$lib/voting.js').Ballot>,
 *   me: string,
 *   myBallot: import('$lib/voting.js').Ballot,
 *   commentCounts?: Record<string, number>
 * }} input
 */
export function buildVoteView({ villas, members, ballots, me, myBallot, commentCounts = {} }) {
	const memberById = new Map(members.map((m) => [m.id, m]));
	const villaById = new Map(villas.map((v) => [v.id, v]));
	const myBudget = memberById.get(me)?.votes ?? VOTE_BUDGET;
	const results = tally({ ...ballots, [me]: myBallot }, villas, members);

	/** @type {Map<string, import('$lib/components/vote/types.js').VillaRow>} */
	const rowById = new Map();
	for (const r of results.byVilla) {
		const villa = villaById.get(r.villaId);
		if (!villa) continue;
		const myPoints = myBallot[r.villaId] ?? 0;
		rowById.set(r.villaId, {
			villa,
			rank: r.rank,
			total: r.total,
			voters: r.voters.flatMap((v) => {
				const member = memberById.get(v.memberId);
				return member ? [{ member, points: v.points }] : [];
			}),
			myPoints,
			canAdd: canIncrement(myBallot, r.villaId, { budget: myBudget }),
			addHint:
				myPoints >= MAX_PER_VILLA
					? `${MAX_PER_VILLA} points is the most one villa can get from you.`
					: `All ${myBudget} points are used. Take one back from another villa first.`,
			comments: commentCounts[r.villaId] ?? 0
		});
	}
	return { results, rowById, memberById, villaById, myBudget };
}
