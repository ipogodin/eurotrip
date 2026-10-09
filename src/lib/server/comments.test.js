import { beforeEach, describe, expect, it } from 'vitest';
import {
	COMMENT_MAX,
	COMMENTS_PER_HOUR,
	MAX_PER_VILLA,
	cleanText,
	commentsVisible,
	postComment,
	removeComment,
	visibleCounts,
	visibleComments
} from './comments.js';
import { createMemoryStore } from './store/memory.js';

const NOW = Date.parse('2026-10-09T18:00:00Z');
/** @type {import('./comments.js').Context} */
const open = { activeIds: ['a', 'b', 'c'], winnerId: null };
/** @type {import('./comments.js').Context} */
const decided = { activeIds: ['a', 'b', 'c'], winnerId: 'b' };
const ann = { id: 'anna', isAdmin: false };
const ben = { id: 'ben', isAdmin: false };
const admin = { id: 'illia', isAdmin: true };

/** @type {ReturnType<typeof createMemoryStore>} */
let store;
beforeEach(() => {
	store = createMemoryStore();
});
const say = (
	/** @type {string} */ villaId,
	/** @type {string} */ memberId,
	/** @type {unknown} */ text,
	ctx = open,
	now = NOW
) => postComment(store, { villaId, memberId, text, now, ctx });

describe('cleanText', () => {
	it('trims, keeps line breaks and limits blank lines', () => {
		expect(cleanText('  Hello  \n\n\n\nworld \r\n ok ')).toBe('Hello\n\nworld\n ok');
	});
	it('removes control characters but not normal text, emoji or accents', () => {
		expect(cleanText('Héllo \u0007there\u0000 ☀️ 🏖')).toBe('Héllo  there  ☀️ 🏖');
	});
	it('gives null for nothing, whitespace or non-text', () => {
		for (const x of ['', '   \n\t ', null, undefined, 5, {}, ['x']])
			expect(cleanText(x)).toBeNull();
	});
	it('leaves HTML as plain characters (the page only ever renders text)', () => {
		expect(cleanText('<img src=x onerror=alert(1)>')).toBe('<img src=x onerror=alert(1)>');
	});
});

describe('who can see comments', () => {
	it('every active villa while voting is open', () => {
		expect(['a', 'b', 'c'].every((id) => commentsVisible(id, open))).toBe(true);
	});
	it('after a winner is picked, only the winner', () => {
		expect(commentsVisible('b', decided)).toBe(true);
		expect(commentsVisible('a', decided)).toBe(false);
		expect(commentsVisible('c', decided)).toBe(false);
	});
	it('never a removed or unknown villa', () => {
		expect(commentsVisible('gone', open)).toBe(false);
	});
});

describe('postComment', () => {
	it('stores a comment with author, text and time', async () => {
		const r = await say('a', 'anna', '  Lovely pool!  ');
		expect(r).toMatchObject({
			ok: true,
			comment: { memberId: 'anna', text: 'Lovely pool!', createdAt: '2026-10-09T18:00:00.000Z' }
		});
		expect(await visibleComments(store, 'a', open)).toHaveLength(1);
	});
	it('refuses empty text and text over the limit, and stores nothing', async () => {
		expect(await say('a', 'anna', '   ')).toMatchObject({ ok: false });
		expect(await say('a', 'anna', 'x'.repeat(COMMENT_MAX + 1))).toMatchObject({ ok: false });
		expect(await say('a', 'anna', 'x'.repeat(COMMENT_MAX))).toMatchObject({ ok: true });
		expect(await store.getComments('a')).toHaveLength(1);
	});
	it('lists oldest first, with unique ids', async () => {
		await say('a', 'anna', 'first', open, NOW);
		await say('a', 'ben', 'second', open, NOW + 60_000);
		await say('a', 'anna', 'third', open, NOW + 120_000);
		const list = await visibleComments(store, 'a', open);
		expect(list.map((c) => c.text)).toEqual(['first', 'second', 'third']);
		expect(new Set(list.map((c) => c.id)).size).toBe(3);
	});
	it('limits how fast one person can post, without affecting others', async () => {
		for (let i = 0; i < COMMENTS_PER_HOUR; i++)
			expect((await say('a', 'anna', `n${i}`)).ok).toBe(true);
		expect(await say('a', 'anna', 'one too many')).toMatchObject({ ok: false });
		expect((await say('a', 'ben', 'still fine')).ok).toBe(true);
	});
	it('stops at the per-villa cap', async () => {
		for (let i = 0; i < MAX_PER_VILLA; i++) {
			await store.addComment('a', {
				id: `c${i}`,
				memberId: 'ben',
				text: 'x',
				createdAt: new Date(NOW + i).toISOString()
			});
		}
		expect(await say('a', 'anna', 'late')).toMatchObject({ ok: false });
	});
	it('refuses a villa that is not on the list', async () => {
		expect(await say('gone', 'anna', 'hello')).toMatchObject({ ok: false });
	});
	it('after a winner is picked: the winner yes, every other villa no', async () => {
		expect((await say('b', 'anna', 'We are going!', decided)).ok).toBe(true);
		expect(await say('a', 'anna', 'sad', decided)).toMatchObject({ ok: false });
	});
});

describe('hiding other villas once a winner is picked', () => {
	beforeEach(async () => {
		await say('a', 'anna', 'about a');
		await say('b', 'ben', 'about b');
		await say('c', 'anna', 'about c');
	});
	it('lists nothing at all for the other villas, but keeps the winner’s', async () => {
		expect((await visibleComments(store, 'b', decided)).map((c) => c.text)).toEqual(['about b']);
		expect(await visibleComments(store, 'a', decided)).toEqual([]);
		expect(await visibleComments(store, 'c', decided)).toEqual([]);
	});
	it('counts nothing for them either', async () => {
		expect(await visibleCounts(store, ['a', 'b', 'c'], open)).toEqual({ a: 1, b: 1, c: 1 });
		expect(await visibleCounts(store, ['a', 'b', 'c'], decided)).toEqual({ a: 0, b: 1, c: 0 });
	});
	it('brings them back if the winner is undone (the comments were only hidden)', async () => {
		expect(await visibleComments(store, 'a', open)).toHaveLength(1);
	});
});

describe('removeComment', () => {
	/** @type {string} */
	let id;
	beforeEach(async () => {
		const r = await say('a', 'anna', 'mine');
		id = /** @type {any} */ (r).comment.id;
	});
	it('the author can delete their own', async () => {
		expect(
			await removeComment(store, { villaId: 'a', commentId: id, member: ann, ctx: open })
		).toEqual({ ok: true });
		expect(await store.getComments('a')).toEqual([]);
	});
	it('the admin can delete anyone’s', async () => {
		expect(
			(await removeComment(store, { villaId: 'a', commentId: id, member: admin, ctx: open })).ok
		).toBe(true);
	});
	it('someone else cannot, and nothing changes', async () => {
		expect(
			await removeComment(store, { villaId: 'a', commentId: id, member: ben, ctx: open })
		).toMatchObject({ ok: false });
		expect(await store.getComments('a')).toHaveLength(1);
	});
	it('a comment that is already gone, or on a hidden villa, gives a clear no', async () => {
		expect(
			await removeComment(store, { villaId: 'a', commentId: 'nope', member: ann, ctx: open })
		).toMatchObject({ ok: false });
		expect(
			await removeComment(store, { villaId: 'a', commentId: id, member: admin, ctx: decided })
		).toMatchObject({ ok: false });
		expect(await store.getComments('a')).toHaveLength(1);
	});
});
