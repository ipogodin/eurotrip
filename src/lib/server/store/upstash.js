import { Redis } from '@upstash/redis';
import { emptyTrip, parseIds, TRIP_FIELDS } from './types.js';

/**
 * With auto-deserialization off, HGETALL comes back as a flat
 * [field, value, field, value, ...] array instead of an object.
 * @param {unknown} raw
 * @returns {Record<string, string>}
 */
export function toHash(raw) {
	if (Array.isArray(raw)) {
		/** @type {Record<string, string>} */
		const out = {};
		for (let i = 0; i + 1 < raw.length; i += 2) out[String(raw[i])] = String(raw[i + 1]);
		return out;
	}
	return raw && typeof raw === 'object' ? /** @type {Record<string, string>} */ (raw) : {};
}

/**
 * Redis-backed store (Upstash REST). Auto-deserialization is off so every
 * value stays the string we wrote (a note like "123" must not become a number).
 * @param {{ url: string; token: string }} cfg
 * @param {Redis} [client]  inject a fake in tests
 * @returns {import('./types.js').Store}
 */
export function createUpstashStore({ url, token }, client) {
	const redis = client ?? new Redis({ url, token, automaticDeserialization: false });

	return {
		async getBallots(memberIds) {
			/** @type {Record<string, import('./types.js').Ballot>} */
			const out = {};
			if (memberIds.length === 0) return out;
			const pipe = redis.pipeline();
			for (const id of memberIds) pipe.hgetall(`ballot:${id}`);
			const results = await pipe.exec();
			memberIds.forEach((id, i) => {
				/** @type {import('./types.js').Ballot} */
				const ballot = {};
				for (const [villa, pts] of Object.entries(toHash(results[i]))) {
					ballot[villa] = /** @type {1 | 2 | 3} */ (Number(pts));
				}
				out[id] = ballot;
			});
			return out;
		},
		async setBallot(memberId, ballot) {
			const key = `ballot:${memberId}`;
			const tx = redis.multi();
			tx.del(key);
			if (Object.keys(ballot).length > 0) tx.hset(key, ballot);
			await tx.exec();
		},
		async getVoting() {
			const h = toHash(await redis.hgetall('voting'));
			return {
				deadline: h.deadline ?? null,
				removed: parseIds(h.removed),
				resetAt: h.resetAt ?? null
			};
		},
		async setVoting(patch) {
			/** @type {Record<string, string>} */
			const set = {};
			/** @type {string[]} */
			const unset = [];
			if (patch.deadline === null) unset.push('deadline');
			else if (patch.deadline !== undefined) set.deadline = patch.deadline;
			if (patch.removed !== undefined) {
				if (patch.removed.length === 0) unset.push('removed');
				else set.removed = JSON.stringify(patch.removed);
			}
			if (patch.resetAt === null) unset.push('resetAt');
			else if (patch.resetAt !== undefined) set.resetAt = patch.resetAt;
			if (Object.keys(set).length) await redis.hset('voting', set);
			if (unset.length) await redis.hdel('voting', ...unset);
		},
		async getTrip() {
			const h = toHash(await redis.hgetall('trip'));
			const out = emptyTrip();
			for (const f of TRIP_FIELDS) out[f] = h[f] ?? null;
			return out;
		},
		async setTrip(patch) {
			/** @type {Record<string, string>} */
			const set = {};
			/** @type {string[]} */
			const unset = [];
			for (const [k, v] of Object.entries(patch)) {
				if (v === null || v === undefined) unset.push(k);
				else set[k] = v;
			}
			if (Object.keys(set).length) await redis.hset('trip', set);
			if (unset.length) await redis.hdel('trip', ...unset);
		},
		async hit(key, ttlSec) {
			const count = Number(await redis.incr(key));
			if (count === 1) await redis.expire(key, ttlSec);
			return count;
		},
		async getValue(key) {
			return (await redis.get(key)) ?? null;
		},
		async setValue(key, value, ttlSec) {
			await redis.set(key, value, { ex: ttlSec });
		},
		async ttl(key) {
			return Math.max(0, Number(await redis.ttl(key)));
		},
		async del(key) {
			await redis.del(key);
		}
	};
}
