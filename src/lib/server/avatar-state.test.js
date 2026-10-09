import { beforeEach, describe, expect, it } from 'vitest';
import { AVATAR_PHRASES } from '../config/avatar-phrases.js';
import { photoVersions, resetPhoto, swapPhoto } from './avatar-state.js';
import { createMemoryStore } from './store/memory.js';

/** @type {ReturnType<typeof createMemoryStore>} */
let store;
beforeEach(() => {
	store = createMemoryStore();
});
const counts = { anna: 2, ben: 3, cara: 1 };

describe('photoVersions', () => {
	it('everyone starts on photo 1; members without photos get 0 (initials only)', async () => {
		expect(await photoVersions(store, ['anna', 'ben', 'cara', 'dan'], counts)).toEqual({
			anna: 1,
			ben: 1,
			cara: 1,
			dan: 0
		});
	});
	it('keeps a stored version inside what exists (e.g. after photos were removed)', async () => {
		await store.setAvatarVersion('anna', 7);
		await store.setAvatarVersion('ben', 2);
		const v = await photoVersions(store, ['anna', 'ben'], counts);
		expect(v).toEqual({ anna: 2, ben: 2 });
	});
});

describe('swapPhoto', () => {
	it('moves up one prepared version each time and returns a phrase', async () => {
		const first = await swapPhoto(store, 'ben', counts);
		expect(first).toMatchObject({ ok: true, version: 2, changed: true });
		expect(AVATAR_PHRASES).toContain(/** @type {any} */ (first).phrase);
		expect(await swapPhoto(store, 'ben', counts)).toMatchObject({ version: 3, changed: true });
		expect((await photoVersions(store, ['ben'], counts)).ben).toBe(3);
	});
	it('goes round to the first photo after the last one', async () => {
		await swapPhoto(store, 'anna', counts);
		expect((await photoVersions(store, ['anna'], counts)).anna).toBe(2);
		const again = await swapPhoto(store, 'anna', counts);
		expect(again).toMatchObject({ ok: true, version: 1, changed: true });
		expect(/** @type {any} */ (again).phrase).toBeTruthy();
		expect((await photoVersions(store, ['anna'], counts)).anna).toBe(1);
		expect(await swapPhoto(store, 'anna', counts)).toMatchObject({ version: 2, changed: true });
	});
	it('a member with only one photo does not change but still gets a phrase', async () => {
		expect(await swapPhoto(store, 'cara', counts)).toMatchObject({ version: 1, changed: false });
	});
	it('refuses a member with no photos at all', async () => {
		expect(await swapPhoto(store, 'dan', counts)).toMatchObject({ ok: false });
	});
	it('only ever changes the member who pressed it', async () => {
		await swapPhoto(store, 'ben', counts);
		expect(await photoVersions(store, ['anna', 'ben', 'cara'], counts)).toEqual({
			anna: 1,
			ben: 2,
			cara: 1
		});
	});
});

describe('resetPhoto (admin)', () => {
	it('puts a member back on their own photo, and only that member', async () => {
		await swapPhoto(store, 'ben', counts);
		await swapPhoto(store, 'ben', counts);
		await swapPhoto(store, 'anna', counts);
		expect(await resetPhoto(store, 'ben', counts)).toMatchObject({ ok: true });
		expect(await photoVersions(store, ['anna', 'ben'], counts)).toEqual({ anna: 2, ben: 1 });
	});
	it('refuses when already on their own photo or without photos', async () => {
		expect(await resetPhoto(store, 'ben', counts)).toMatchObject({ ok: false });
		expect(await resetPhoto(store, 'dan', counts)).toMatchObject({ ok: false });
	});
});
