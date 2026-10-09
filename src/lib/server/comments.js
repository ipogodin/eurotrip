import { randomBytes } from 'node:crypto';

/**
 * Public comments on villas. Plain functions over the store (no SvelteKit
 * imports), so every rule is unit-tested.
 *
 * @typedef {import('./store/types.js').Store} Store
 * @typedef {import('./store/types.js').Comment} Comment
 * @typedef {{ activeIds: string[], winnerId: string | null }} Context
 *   `activeIds` = villas still on the list; `winnerId` = the picked villa, if any
 * @typedef {{ ok: true, comment: Comment } | { ok: false, error: string }} PostOutcome
 * @typedef {{ ok: true } | { ok: false, error: string }} Outcome
 */

export const COMMENT_MAX = 500;
/** Posts per member per hour: only here to stop accidents (8 trusted people). */
export const COMMENTS_PER_HOUR = 10;
/** A sanity cap per villa, so a runaway page can never grow without limit. */
export const MAX_PER_VILLA = 200;

/**
 * Whether a villa's comments exist for people at all. Once a winner is picked,
 * ONLY the winner's comments remain: every other villa's are hidden completely
 * (not listed, not counted, not postable), as are those of removed villas.
 * @param {string} villaId
 * @param {Context} ctx
 */
export function commentsVisible(villaId, { activeIds, winnerId }) {
	if (!activeIds.includes(villaId)) return false;
	return !winnerId || winnerId === villaId;
}

/**
 * A comment as plain text: line breaks kept (at most one blank line), control
 * characters removed, trimmed. Returns null when nothing is left. It is always
 * rendered as text by the page, never as HTML.
 * @param {unknown} input
 * @returns {string | null}
 */
export function cleanText(input) {
	if (typeof input !== 'string') return null;
	const text = input
		.replace(/\r\n?/g, '\n')
		// eslint-disable-next-line no-control-regex -- strip control characters except newline
		.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	return text || null;
}

/** @returns {string} */
function newId() {
	return `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`;
}

/**
 * The comments people may see for a villa (oldest first), or none at all.
 * @param {Store} store
 * @param {string} villaId
 * @param {Context} ctx
 * @returns {Promise<Comment[]>}
 */
export async function visibleComments(store, villaId, ctx) {
	return commentsVisible(villaId, ctx) ? store.getComments(villaId) : [];
}

/**
 * Comment counts for the villas people may see; everything else counts as 0.
 * @param {Store} store
 * @param {string[]} villaIds
 * @param {Context} ctx
 * @returns {Promise<Record<string, number>>}
 */
export async function visibleCounts(store, villaIds, ctx) {
	const shown = villaIds.filter((id) => commentsVisible(id, ctx));
	const counts = await store.getCommentCounts(shown);
	return Object.fromEntries(villaIds.map((id) => [id, counts[id] ?? 0]));
}

/**
 * @param {Store} store
 * @param {{ villaId: string, memberId: string, text: unknown, now: number, ctx: Context }} args
 * @returns {Promise<PostOutcome>}
 */
export async function postComment(store, { villaId, memberId, text, now, ctx }) {
	if (!commentsVisible(villaId, ctx)) {
		return { ok: false, error: 'Comments are closed for this villa.' };
	}
	const clean = cleanText(text);
	if (!clean) return { ok: false, error: 'Write something first.' };
	if (clean.length > COMMENT_MAX) {
		return {
			ok: false,
			error: `Comments can be up to ${COMMENT_MAX} characters (this is ${clean.length}).`
		};
	}
	if ((await store.hit(`cmt:rl:${memberId}`, 3600)) > COMMENTS_PER_HOUR) {
		return { ok: false, error: 'That is a lot of comments. Try again in a bit.' };
	}
	if ((await store.getComments(villaId)).length >= MAX_PER_VILLA) {
		return { ok: false, error: 'This villa has reached its comment limit.' };
	}
	/** @type {Comment} */
	const comment = { id: newId(), memberId, text: clean, createdAt: new Date(now).toISOString() };
	await store.addComment(villaId, comment);
	return { ok: true, comment };
}

/**
 * Delete a comment: its author can, and so can the admin.
 * @param {Store} store
 * @param {{ villaId: string, commentId: string, member: { id: string, isAdmin: boolean }, ctx: Context }} args
 * @returns {Promise<Outcome>}
 */
export async function removeComment(store, { villaId, commentId, member, ctx }) {
	if (!commentsVisible(villaId, ctx))
		return { ok: false, error: 'Comments are closed for this villa.' };
	const comment = (await store.getComments(villaId)).find((c) => c.id === commentId);
	if (!comment) return { ok: false, error: 'That comment is already gone.' };
	if (comment.memberId !== member.id && !member.isAdmin) {
		return { ok: false, error: 'You can only delete your own comments.' };
	}
	await store.deleteComment(villaId, commentId);
	return { ok: true };
}
