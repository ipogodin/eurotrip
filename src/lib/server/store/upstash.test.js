import { describe, expect, it } from 'vitest';
import { createUpstashStore, toHash } from './upstash.js';

describe('toHash', () => {
	it('converts a flat HGETALL array into an object', () => {
		expect(toHash(['a', '1', 'b', 'x'])).toEqual({ a: '1', b: 'x' });
	});
	it('passes objects through and treats null/empty as {}', () => {
		expect(toHash({ a: '1' })).toEqual({ a: '1' });
		expect(toHash(null)).toEqual({});
		expect(toHash([])).toEqual({});
	});
});

/** A tiny in-memory stand-in for the Redis commands the voting hash uses. */
function fakeRedis() {
	/** @type {Map<string, Record<string, string>>} */
	const hashes = new Map();
	/** @type {Map<string, string>} */
	const strings = new Map();
	return {
		hashes,
		strings,
		async hgetall(/** @type {string} */ key) {
			// Auto-deserialization off: Upstash returns a flat [field, value, ...] array.
			return Object.entries(hashes.get(key) ?? {}).flat();
		},
		async hset(/** @type {string} */ key, /** @type {Record<string,string>} */ obj) {
			hashes.set(key, { ...(hashes.get(key) ?? {}), ...obj });
		},
		async get(/** @type {string} */ key) {
			return strings.get(key) ?? null;
		},
		async set(/** @type {string} */ key, /** @type {string} */ value) {
			strings.set(key, value);
		},
		async hdel(/** @type {string} */ key, /** @type {string[]} */ ...fields) {
			const h = { ...(hashes.get(key) ?? {}) };
			for (const f of fields) delete h[f];
			hashes.set(key, h);
		}
	};
}

describe('upstash store: voting hash', () => {
	const make = () => {
		const redis = fakeRedis();
		const store = createUpstashStore(
			{ url: 'x', token: 'y' },
			/** @type {never} */ (/** @type {unknown} */ (redis))
		);
		return { redis, store };
	};

	it('reads an empty hash as defaults', async () => {
		expect(await make().store.getVoting()).toEqual({ deadline: null, removed: [], resetAt: null });
	});

	it('writes and reads deadline, removed list and reset time', async () => {
		const { redis, store } = make();
		await store.setVoting({
			deadline: '2026-10-11T00:00:00Z',
			removed: ['a', 'b'],
			resetAt: '2026-10-09T01:00:00Z'
		});
		expect(redis.hashes.get('voting')?.removed).toBe('["a","b"]');
		expect(await store.getVoting()).toEqual({
			deadline: '2026-10-11T00:00:00Z',
			removed: ['a', 'b'],
			resetAt: '2026-10-09T01:00:00Z'
		});
	});

	it('clears fields without touching the others', async () => {
		const { store } = make();
		await store.setVoting({ deadline: '2026-10-11T00:00:00Z', removed: ['a'] });
		await store.setVoting({ removed: [] });
		expect(await store.getVoting()).toEqual({
			deadline: '2026-10-11T00:00:00Z',
			removed: [],
			resetAt: null
		});
		await store.setVoting({ deadline: null });
		expect((await store.getVoting()).deadline).toBeNull();
	});

	it('treats a corrupted removed list as empty', async () => {
		const { redis, store } = make();
		redis.hashes.set('voting', { removed: '{not json' });
		expect((await store.getVoting()).removed).toEqual([]);
	});

	it('stores avatar versions and counts as numbers, images as plain strings', async () => {
		const { redis, store } = make();
		await store.setAvatarVersion('a', 2);
		await store.setAvatarCount('a', 3);
		expect(redis.hashes.get('avatars:version')).toEqual({ a: '2' });
		expect(await store.getAvatarVersions()).toEqual({ a: 2 });
		expect(await store.getAvatarCounts()).toEqual({ a: 3 });
		await store.setAvatarImage('a', 2, 'UklGRg==');
		expect(redis.strings.get('avatar:img:a:2')).toBe('UklGRg==');
		expect(await store.getAvatarImage('a', 2)).toBe('UklGRg==');
		expect(await store.getAvatarImage('a', 9)).toBeNull();
	});

	it('ignores corrupted numbers in the avatar hashes', async () => {
		const { redis, store } = make();
		redis.hashes.set('avatars:version', { a: '2', b: 'oops' });
		expect(await store.getAvatarVersions()).toEqual({ a: 2 });
	});
});
