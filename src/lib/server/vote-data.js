import { DEFAULT_DEADLINE } from '$lib/config/voting.js';
import { effectiveDeadline, votingState } from '$lib/voting.js';
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
		state: votingState(Date.now(), deadline, trip.winnerId)
	};
}

/**
 * Everything the vote screens need (the map page and each villa page):
 * who I am, the roster, all ballots, and the voting status. Villa facts come
 * from the config import, not from here.
 * @param {import('$lib/server/members.js').PublicMember} me
 */
export async function loadVoteData(me) {
	const members = publicMembers();
	const [ballots, status] = await Promise.all([
		getStore().getBallots(members.map((m) => m.id)),
		votingStatus()
	]);
	return { me: me.id, members, ballots, ...status };
}
