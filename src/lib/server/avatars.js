import { existsSync, readdirSync } from 'node:fs';

/**
 * Where the photos come from.
 *  - Live site: pre-made 256 px WebPs stored in Redis (private; uploaded with
 *    `npm run avatars:upload`), served only to signed-in members.
 *  - Local development (`npm run dev`): read straight from the git-ignored
 *    `avatars/` folder, so you can see the real photos without uploading anything.
 *    That branch is removed from the production build.
 *
 * @typedef {import('./store/types.js').Store} Store
 */

const FILE = /^(.+)_(\d+)\.(jpe?g|png|webp)$/i;
const folder = () => `${process.cwd()}/avatars`;

/** Dev only: how many consecutive versions (1, 2, 3 ...) each member has on disk. @returns {Record<string, number>} */
function devCounts() {
	if (!existsSync(folder())) return {};
	/** @type {Record<string, Set<number>>} */
	const found = {};
	for (const f of readdirSync(folder())) {
		const m = FILE.exec(f);
		if (m) (found[m[1]] ??= new Set()).add(Number(m[2]));
	}
	/** @type {Record<string, number>} */
	const counts = {};
	for (const [id, versions] of Object.entries(found)) {
		let n = 0;
		while (versions.has(n + 1)) n++;
		if (n > 0) counts[id] = n;
	}
	return counts;
}

/**
 * How many photo versions each member has.
 * @param {Store} store
 * @returns {Promise<Record<string, number>>}
 */
export async function avatarCounts(store) {
	const stored = await store.getAvatarCounts();
	if (Object.keys(stored).length > 0) return stored;
	return import.meta.env.DEV ? devCounts() : stored;
}

/** @type {Map<string, Buffer>} */
const devCache = new Map();

/**
 * The image bytes for one member's photo version, or null.
 * @param {Store} store
 * @param {string} memberId
 * @param {number} version
 * @returns {Promise<Buffer | null>}
 */
export async function avatarImage(store, memberId, version) {
	const base64 = await store.getAvatarImage(memberId, version);
	if (base64) return Buffer.from(base64, 'base64');
	if (import.meta.env.DEV) {
		const key = `${memberId}:${version}`;
		const cached = devCache.get(key);
		if (cached) return cached;
		const file = existsSync(folder())
			? readdirSync(folder()).find((f) => {
					const m = FILE.exec(f);
					return m && m[1] === memberId && Number(m[2]) === version;
				})
			: undefined;
		if (!file) return null;
		const { processAvatar } = await import('./avatar-image.js');
		const bytes = await processAvatar(`${folder()}/${file}`);
		devCache.set(key, bytes);
		return bytes;
	}
	return null;
}
