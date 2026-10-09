import { emptyTrip, parseIds, TRIP_FIELDS } from './types.js';

/**
 * In-memory store for local dev and tests. Not shared between serverless
 * instances, so it must never be used in production.
 * @returns {import('./types.js').Store}
 */
export function createMemoryStore() {
	/** @type {Map<string, Record<string, import('./types.js').Ballot[string]>>} */
	const ballots = new Map();
	/** @type {Record<string, string>} */
	const voting = {};
	/** @type {Record<string, string>} */
	const trip = {};
	/** @type {Map<string, { value: string; expires: number }>} */
	const kv = new Map();
	/** @type {Record<string, number>} member id -> the photo version they show */
	const avatarVersions = {};
	/** @type {Record<string, number>} member id -> how many photo versions exist */
	const avatarCounts = {};
	/** @type {Map<string, string>} "id:version" -> base64 image */
	const avatarImages = new Map();

	/** @param {string} key */
	function live(key) {
		const entry = kv.get(key);
		if (!entry) return null;
		if (entry.expires <= Date.now()) {
			kv.delete(key);
			return null;
		}
		return entry;
	}

	return {
		async getBallots(memberIds) {
			/** @type {Record<string, import('./types.js').Ballot>} */
			const out = {};
			for (const id of memberIds) out[id] = { ...(ballots.get(id) ?? {}) };
			return out;
		},
		async setBallot(memberId, ballot) {
			if (Object.keys(ballot).length === 0) ballots.delete(memberId);
			else ballots.set(memberId, { ...ballot });
		},
		async getVoting() {
			return {
				deadline: voting.deadline ?? null,
				removed: parseIds(voting.removed),
				resetAt: voting.resetAt ?? null
			};
		},
		async setVoting(patch) {
			if (patch.deadline === null) delete voting.deadline;
			else if (patch.deadline !== undefined) voting.deadline = patch.deadline;
			if (patch.removed !== undefined) {
				if (patch.removed.length === 0) delete voting.removed;
				else voting.removed = JSON.stringify(patch.removed);
			}
			if (patch.resetAt === null) delete voting.resetAt;
			else if (patch.resetAt !== undefined) voting.resetAt = patch.resetAt;
		},
		async getTrip() {
			const out = emptyTrip();
			for (const f of TRIP_FIELDS) out[f] = trip[f] ?? null;
			return out;
		},
		async setTrip(patch) {
			for (const [k, v] of Object.entries(patch)) {
				if (v === null || v === undefined) delete trip[k];
				else trip[k] = v;
			}
		},
		async hit(key, ttlSec) {
			const entry = live(key);
			const count = entry ? Number(entry.value) + 1 : 1;
			kv.set(key, {
				value: String(count),
				expires: entry ? entry.expires : Date.now() + ttlSec * 1000
			});
			return count;
		},
		async getValue(key) {
			return live(key)?.value ?? null;
		},
		async setValue(key, value, ttlSec) {
			kv.set(key, { value, expires: Date.now() + ttlSec * 1000 });
		},
		async ttl(key) {
			const entry = live(key);
			return entry ? Math.ceil((entry.expires - Date.now()) / 1000) : 0;
		},
		async del(key) {
			kv.delete(key);
		},
		async getAvatarVersions() {
			return { ...avatarVersions };
		},
		async setAvatarVersion(memberId, version) {
			avatarVersions[memberId] = version;
		},
		async getAvatarCounts() {
			return { ...avatarCounts };
		},
		async setAvatarCount(memberId, count) {
			avatarCounts[memberId] = count;
		},
		async getAvatarImage(memberId, version) {
			return avatarImages.get(`${memberId}:${version}`) ?? null;
		},
		async setAvatarImage(memberId, version, base64) {
			avatarImages.set(`${memberId}:${version}`, base64);
		}
	};
}
