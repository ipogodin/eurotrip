import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createMemoryStore } from './memory.js';
import { createUpstashStore } from './upstash.js';

/** @type {import('./types.js').Store | undefined} */
let store;

/**
 * Returns the app-wide store. Production: Upstash (a hard error without it).
 * Dev: in-memory by default, because `.env.local` holds the PRODUCTION Redis
 * credentials and dev actions must not touch real votes. Set
 * `USE_REDIS_IN_DEV=1` to knowingly use the real database.
 * @returns {import('./types.js').Store}
 */
export function getStore() {
	if (store) return store;
	// The Vercel Marketplace integration injects KV_REST_API_*; plain Upstash
	// setups use UPSTASH_REDIS_REST_*.
	const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
	const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
	if (url && token && (!dev || env.USE_REDIS_IN_DEV === '1')) {
		store = createUpstashStore({ url, token });
	} else if (dev) {
		console.warn(
			'[store] Dev: using a volatile in-memory store (set USE_REDIS_IN_DEV=1 for real Redis).'
		);
		store = createMemoryStore();
	} else {
		throw new Error('Redis is not configured (missing KV_REST_API_URL / KV_REST_API_TOKEN).');
	}
	return store;
}
