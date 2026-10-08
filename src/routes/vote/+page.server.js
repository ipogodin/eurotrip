import { error, fail } from '@sveltejs/kit';
import { DEFAULT_DEADLINE } from '$lib/config/voting.js';
import { villas } from '$lib/config/villas.js';
import { effectiveDeadline, spent, validateBallot, votingState } from '$lib/voting.js';
import { findMemberById, getMembers } from '$lib/server/roster.js';
import { getStore } from '$lib/server/store/index.js';

const villaIds = villas.map((v) => v.id);

/** Everyone's public identity + point budget, in roster order. Never phrases. */
function publicMembers() {
	return getMembers().map(({ id, name, short, votes }) => ({ id, name, short, votes }));
}

/** Current deadline, state and winner, always computed with server time. */
async function votingStatus() {
	const store = getStore();
	const [voting, trip] = await Promise.all([store.getVoting(), store.getTrip()]);
	const deadline = effectiveDeadline(voting.deadline, DEFAULT_DEADLINE);
	return {
		deadline,
		winnerId: trip.winnerId,
		state: votingState(Date.now(), deadline, trip.winnerId)
	};
}

// Villa facts and the tally aren't sent: the client imports the villa config
// and runs the same pure `tally()` on these ballots, so polling stays small.
export async function load({ locals, depends }) {
	depends('app:votes');
	if (!locals.member) error(401, 'Sign in first.');

	const members = publicMembers();
	const [ballots, status] = await Promise.all([
		getStore().getBallots(members.map((m) => m.id)),
		votingStatus()
	]);
	return { me: locals.member.id, members, ballots, ...status };
}

export const actions = {
	// The whole ballot is replaced on every save. The server re-validates
	// everything; UI limits are only a convenience.
	save: async ({ locals, request }) => {
		if (!locals.member) error(401, 'Sign in first.');

		const raw = (await request.formData()).get('ballot');
		/** @type {unknown} */
		let input;
		try {
			input = JSON.parse(typeof raw === 'string' ? raw : '');
		} catch {
			return fail(400, { message: 'Invalid ballot.' });
		}

		const me = locals.member.id;
		const [{ state }, saved] = await Promise.all([votingStatus(), getStore().getBallots([me])]);
		const result = validateBallot(input, {
			villaIds,
			state,
			budget: findMemberById(me)?.votes,
			previousSpent: spent(saved[me] ?? {})
		});
		if (!result.ok) {
			const status = result.code === 'closed' || result.code === 'decided' ? 409 : 400;
			return fail(status, { message: result.error });
		}

		await getStore().setBallot(
			me,
			/** @type {import('$lib/server/store/types.js').Ballot} */ (result.ballot)
		);
		return { ballot: result.ballot };
	}
};
