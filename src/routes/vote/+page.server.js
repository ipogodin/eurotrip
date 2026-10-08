import { fail } from '@sveltejs/kit';
import { pruneBallot, spent, validateBallot } from '$lib/voting.js';
import { requireMember } from '$lib/server/guards.js';
import { findMemberById } from '$lib/server/roster.js';
import { getStore } from '$lib/server/store/index.js';
import { activeVillaIds, loadVoteData, votingStatus } from '$lib/server/vote-data.js';

// Villa facts and the tally aren't sent: the client imports the villa config
// and runs the same pure `tally()` on these ballots, so polling stays small.
export async function load({ locals, depends }) {
	depends('app:votes');
	return loadVoteData(requireMember(locals));
}

export const actions = {
	// The whole ballot is replaced on every save. The server re-validates
	// everything; UI limits are only a convenience. The villa pages post here too.
	save: async ({ locals, request }) => {
		const member = requireMember(locals);

		const raw = (await request.formData()).get('ballot');
		/** @type {unknown} */
		let input;
		try {
			input = JSON.parse(typeof raw === 'string' ? raw : '');
		} catch {
			return fail(400, { message: 'Invalid ballot.' });
		}

		const me = member.id;
		const [{ state, removed }, saved] = await Promise.all([
			votingStatus(),
			getStore().getBallots([me])
		]);
		// Only villas still on the list can get points; leftovers on removed ones don't count.
		const villaIds = activeVillaIds(removed);
		const result = validateBallot(input, {
			villaIds,
			state,
			budget: findMemberById(me)?.votes,
			previousSpent: spent(pruneBallot(saved[me] ?? {}, villaIds))
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
