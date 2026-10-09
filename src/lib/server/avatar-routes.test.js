/**
 * The photo routes: who may see which photo, who may press "update photo", and
 * what the admin can reset. Mocked store and roster; no real photos involved.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStore } from './store/memory.js';

const h = vi.hoisted(() => ({
	/** @type {import('./store/types.js').Store | null} */ store: null,
	members: [
		{ id: 'anna', name: 'Anna A', short: 'Anna', admin: true, votes: 6, phrase: 'zz-aa' },
		{ id: 'ben', name: 'Ben B', short: 'Ben', admin: false, votes: 6, phrase: 'zz-bb' },
		{ id: 'cara', name: 'Cara C', short: 'Cara', admin: false, votes: 6, phrase: 'zz-cc' }
	]
}));
vi.mock('./store/index.js', () => ({ getStore: () => h.store }));
vi.mock('./roster.js', () => ({
	getMembers: () => h.members,
	findMemberById: (/** @type {string} */ id) => h.members.find((m) => m.id === id),
	hueFor: () => 1
}));

const image = await import('../../routes/avatars/[id]/[version]/+server.js');
const swap = await import('../../routes/avatars/swap/+server.js');
const admin = await import('../../routes/admin/+page.server.js');
const vote = await import('../../routes/vote/+page.server.js');

/** @param {string} id */
const as = (id) =>
	/** @type {App.Locals} */ ({
		member: { id, name: id, short: id, isAdmin: id === 'anna', votes: 6, hue: 1 }
	});
const anon = /** @type {App.Locals} */ ({ member: null });
/** @param {unknown} fn @returns {Promise<{ status: number, res?: any }>} */
async function run(fn) {
	try {
		const res = /** @type {any} */ (await fn);
		return { status: res?.status ?? 200, res };
	} catch (e) {
		return { status: /** @type {{ status: number }} */ (e).status };
	}
}
const get = (
	/** @type {App.Locals} */ locals,
	/** @type {string} */ id,
	/** @type {string} */ version
) => run(/** @type {any} */ (image.GET)({ locals, params: { id, version } }));
const pressUpdate = (/** @type {App.Locals} */ locals, type = 'multipart/form-data; boundary=x') =>
	run(
		/** @type {any} */ (swap.POST)({
			locals,
			request: new Request('http://x/avatars/swap', {
				method: 'POST',
				headers: { 'content-type': type },
				body: 'x'
			})
		})
	);
const store = () => /** @type {import('./store/types.js').Store} */ (h.store);

beforeEach(async () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-10-09T18:00:00Z'));
	h.store = createMemoryStore();
	for (const id of ['anna', 'ben', 'cara']) {
		await store().setAvatarCount(id, id === 'cara' ? 1 : 2);
		await store().setAvatarImage(id, 1, Buffer.from(`${id}-one`).toString('base64'));
		await store().setAvatarImage(id, 2, Buffer.from(`${id}-two`).toString('base64'));
	}
});

describe('GET /avatars/<id>/<version>', () => {
	it("shows any signed-in member everyone's current photo, as a private image", async () => {
		const r = await get(as('ben'), 'anna', '1');
		expect(r.status).toBe(200);
		expect(r.res.headers.get('content-type')).toBe('image/webp');
		expect(r.res.headers.get('cache-control')).toMatch(/^private/);
		expect(Buffer.from(await r.res.arrayBuffer()).toString()).toBe('anna-one');
	});
	it('turns anonymous visitors away', async () => {
		expect((await get(anon, 'anna', '1')).status).toBe(401);
	});
	it("does not reveal a member's next photo before they have it (no spoilers)", async () => {
		expect((await get(as('ben'), 'anna', '2')).status).toBe(404); // anna is still on 1
		expect((await get(as('anna'), 'anna', '2')).status).toBe(404); // not even her own
		await pressUpdate(as('anna'));
		expect((await get(as('ben'), 'anna', '2')).status).toBe(200); // now it's public
		expect((await get(as('ben'), 'anna', '1')).status).toBe(200); // the old one still works
	});
	it('404s on unknown members, junk and out-of-range versions', async () => {
		for (const [id, v] of [
			['nobody', '1'],
			['anna', 'abc'],
			['anna', '0'],
			['anna', '-1'],
			['anna', '1.5'],
			['anna', '99']
		]) {
			expect((await get(as('ben'), id, v)).status, `${id}/${v}`).toBe(404);
		}
	});
});

describe('POST /avatars/swap  ("Change photo")', () => {
	it('moves the member to their next prepared photo and returns a phrase', async () => {
		const r = await pressUpdate(as('ben'));
		expect(r.status).toBe(200);
		expect(await r.res.json()).toMatchObject({
			version: 2,
			changed: true,
			phrase: expect.any(String)
		});
	});
	it('needs a signed-in member and a real form post (the cross-site check applies to those)', async () => {
		expect((await pressUpdate(anon)).status).toBe(401);
		expect((await pressUpdate(as('ben'), 'application/json')).status).toBe(415);
		expect((await pressUpdate(as('ben'), 'text/plain')).status).toBe(415);
		expect((await store().getAvatarVersions()).ben).toBeUndefined();
	});
	it('only ever changes the member who pressed it, and everyone else sees the change', async () => {
		await pressUpdate(as('ben'));
		const data = await vote.load(/** @type {any} */ ({ locals: as('cara'), depends() {} }));
		const photos = Object.fromEntries(data.members.map((/** @type {any} */ m) => [m.id, m.photo]));
		expect(photos).toEqual({ anna: 1, ben: 2, cara: 1 });
	});
	it('a member who is already on their last photo stays there', async () => {
		const r = await pressUpdate(as('cara')); // cara has only one photo
		expect(await r.res.json()).toMatchObject({ version: 1, changed: false });
	});
	it('a member with no photos gets a clear refusal', async () => {
		await store().setAvatarCount('cara', 0);
		h.members.push({
			id: 'dan',
			name: 'Dan',
			short: 'Dan',
			admin: false,
			votes: 6,
			phrase: 'zz-dd'
		});
		expect((await pressUpdate(as('dan'))).status).toBe(400);
		h.members.pop();
	});
});

describe('admin: Profile photos', () => {
	const reset = (/** @type {App.Locals} */ locals, memberId = 'ben') =>
		run(
			/** @type {any} */ (admin.actions.resetPhoto)({
				locals,
				request: new Request('http://x', {
					method: 'POST',
					body: (() => {
						const f = new FormData();
						f.set('memberId', memberId);
						return f;
					})()
				})
			})
		);
	it('the admin can put a member back on their own photo', async () => {
		await pressUpdate(as('ben'));
		expect((await reset(as('anna'))).status).toBe(200);
		expect((await store().getAvatarVersions()).ben).toBe(1);
	});
	it('non-admins get 403 and nothing changes', async () => {
		await pressUpdate(as('ben'));
		expect((await reset(as('cara'))).status).toBe(403);
		expect((await reset(as('ben'))).status).toBe(403);
		expect((await store().getAvatarVersions()).ben).toBe(2);
	});
	it('refuses a member that does not exist, or one already on their own photo', async () => {
		expect((await reset(as('anna'), 'nobody')).status).toBe(400);
		expect((await reset(as('anna'), 'ben')).status).toBe(400); // already on photo 1
	});
	it("the admin page lists each member's photo version", async () => {
		await pressUpdate(as('ben'));
		const data = await run(/** @type {any} */ (admin.load)({ locals: as('anna') }));
		const photos = Object.fromEntries(
			data.res.members.map((/** @type {any} */ m) => [m.id, m.photo])
		);
		expect(photos).toEqual({ anna: 1, ben: 2, cara: 1 });
		expect(data.res.photoCounts).toEqual({ anna: 2, ben: 2, cara: 1 });
	});
});
