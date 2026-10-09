import { pickPhrase, currentVersion, nextVersion } from '../avatar.js';
import { AVATAR_PHRASES } from '../config/avatar-phrases.js';

/**
 * Which photo each member shows, and the "update photo" prank. Plain functions
 * over the store (no SvelteKit imports), so they're unit-tested.
 *
 * @typedef {import('./store/types.js').Store} Store
 * `counts` = how many photo versions each member has (from the upload).
 */

/**
 * The version each member currently shows (0 = no photos, so initials only).
 * @param {Store} store
 * @param {string[]} memberIds
 * @param {Record<string, number>} counts
 * @returns {Promise<Record<string, number>>}
 */
export async function photoVersions(store, memberIds, counts) {
	const stored = await store.getAvatarVersions();
	/** @type {Record<string, number>} */
	const out = {};
	for (const id of memberIds) {
		const latest = counts[id] ?? 0;
		out[id] = latest > 0 ? currentVersion(stored[id], latest) : 0;
	}
	return out;
}

/**
 * The member "updates" their photo: they move up one prepared version (never
 * the picture they chose) and get a random phrase to go with it.
 * @param {Store} store
 * @param {string} memberId
 * @param {Record<string, number>} counts
 * @param {{ random?: () => number }} [opts]
 * @returns {Promise<{ ok: true, version: number, changed: boolean, phrase: string } | { ok: false, error: string }>}
 */
export async function swapPhoto(store, memberId, counts, { random } = {}) {
	const latest = counts[memberId] ?? 0;
	if (latest < 1) return { ok: false, error: 'There is no photo for you yet.' };
	const stored = (await store.getAvatarVersions())[memberId];
	const { version, changed } = nextVersion(stored, latest);
	if (changed) await store.setAvatarVersion(memberId, version);
	return { ok: true, version, changed, phrase: pickPhrase(AVATAR_PHRASES, { random }) };
}

/**
 * Admin: put a member back on their own photo (version 1).
 * @param {Store} store
 * @param {string} memberId
 * @param {Record<string, number>} counts
 * @returns {Promise<{ ok: true, message: string } | { ok: false, error: string }>}
 */
export async function resetPhoto(store, memberId, counts) {
	if ((counts[memberId] ?? 0) < 1) return { ok: false, error: 'That member has no photos.' };
	const [now] = Object.values(await photoVersions(store, [memberId], counts));
	if (now === 1) return { ok: false, error: 'They are already on their own photo.' };
	await store.setAvatarVersion(memberId, 1);
	return { ok: true, message: 'Photo reset to their own.' };
}
