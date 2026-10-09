import { error, fail } from '@sveltejs/kit';
import { findVilla } from '$lib/config/villas.js';
import { COMMENT_MAX, postComment, removeComment, visibleComments } from '$lib/server/comments.js';
import { requireMember } from '$lib/server/guards.js';
import { getStore } from '$lib/server/store/index.js';
import { activeVillaIds, loadVoteData, votingStatus } from '$lib/server/vote-data.js';

/** What comments may be shown right now: the active villas, and the winner alone once picked. */
async function commentContext() {
	const { removed, winnerId } = await votingStatus();
	return { activeIds: activeVillaIds(removed), winnerId };
}

export async function load({ locals, params, depends }) {
	depends('app:votes');
	const member = requireMember(locals);
	if (!findVilla(params.id)) error(404, 'That villa is not on the list.');
	// A removed villa still loads: the page explains instead of showing a bare error.
	const data = await loadVoteData(member);
	// Comments come with the page and refresh with it. For a villa that people can no
	// longer see comments for (not the winner, once decided) this is empty, not hidden.
	const comments = await visibleComments(getStore(), params.id, await commentContext());
	return { villaId: params.id, commentMax: COMMENT_MAX, comments, ...data };
}

export const actions = {
	comment: async ({ locals, params, request }) => {
		const member = requireMember(locals);
		if (!findVilla(params.id)) error(404, 'That villa is not on the list.');
		const text = (await request.formData()).get('text');
		const result = await postComment(getStore(), {
			villaId: params.id,
			memberId: member.id,
			text,
			now: Date.now(),
			ctx: await commentContext()
		});
		return result.ok ? { message: 'Posted.' } : fail(400, { message: result.error });
	},
	deleteComment: async ({ locals, params, request }) => {
		const member = requireMember(locals);
		if (!findVilla(params.id)) error(404, 'That villa is not on the list.');
		const commentId = (await request.formData()).get('commentId');
		if (typeof commentId !== 'string') return fail(400, { message: 'Missing comment.' });
		const result = await removeComment(getStore(), {
			villaId: params.id,
			commentId,
			member: { id: member.id, isAdmin: member.isAdmin },
			ctx: await commentContext()
		});
		return result.ok ? { message: 'Deleted.' } : fail(400, { message: result.error });
	}
};
