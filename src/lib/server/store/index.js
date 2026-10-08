import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createMemoryStore } from './memory.js';
import { createUpstashStore } from './upstash.js';

/** @type {import('./types.js').Store | undefined} */
let store;

/**
 * Returns the app-wide store: Upstash when its env vars exist, otherwise an
 * in-memory store in dev. Production without Redis is a hard error.
 * @returns {import('./types.js').Store}
 */
export function getStore() {
	if (store) return store;
	// The Vercel Marketplace integration injects KV_REST_API_*; plain Upstash
	// setups use UPSTASH_REDIS_REST_*.
	const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
	const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
	if (url && token) {
		store = createUpstashStore({ url, token });
	} else if (dev) {
		console.warn('[store] No Redis env vars: using a volatile in-memory store (dev only).');
		store = createMemoryStore();
	} else {
		throw new Error('Redis is not configured (missing KV_REST_API_URL / KV_REST_API_TOKEN).');
	}
	return store;
}
