/**
 * Login brute-force protection. All state lives in the store (Redis), so it
 * holds across serverless instances. The browser can't be trusted, so every
 * rule here is enforced server-side; the splash page's cooldown timer is only
 * a courtesy.
 *
 * Rules (see docs/tech-spec.md "Anti-brute-force"):
 *  - 5 failures from one IP in 15 min   -> locked; each repeat in 24 h doubles
 *    the lock (15, 30, 60 ... min, capped at 24 h)
 *  - 20 failures from one IP in a day   -> locked until the day window ends
 *  - 60 failures from anyone in an hour -> all new logins paused for 15 min
 */

/** @typedef {import('./store/types.js').Store} Store */

export const LIMITS = {
	ipMax: 5,
	ipWindowSec: 900,
	baseLockSec: 900,
	maxLockSec: 86_400,
	dayMax: 20,
	daySec: 86_400,
	globalMax: 60,
	globalWindowSec: 3600,
	pauseSec: 900
};

const k = {
	ip: (/** @type {string} */ ip) => `rl:ip:${ip}`,
	lvl: (/** @type {string} */ ip) => `rl:lvl:${ip}`,
	lock: (/** @type {string} */ ip) => `rl:lock:${ip}`,
	day: (/** @type {string} */ ip) => `rl:day:${ip}`,
	global: 'rl:global',
	pause: 'rl:pause',
	stats: 'stats:fails'
};

/**
 * Whether a login attempt may proceed right now.
 * @param {Store} store
 * @param {string} ip
 * @returns {Promise<{ allowed: boolean, retryAfter: number }>}
 */
export async function checkLogin(store, ip) {
	const [lock, pause] = await Promise.all([store.ttl(k.lock(ip)), store.ttl(k.pause)]);
	const wait = Math.max(lock, pause);
	return wait > 0 ? { allowed: false, retryAfter: wait } : { allowed: true, retryAfter: 0 };
}

/**
 * Record a failed attempt and apply any lock it triggers.
 * @param {Store} store
 * @param {string} ip
 * @returns {Promise<void>}
 */
export async function recordFailure(store, ip) {
	const [n, day, global] = await Promise.all([
		store.hit(k.ip(ip), LIMITS.ipWindowSec),
		store.hit(k.day(ip), LIMITS.daySec),
		store.hit(k.global, LIMITS.globalWindowSec),
		store.hit(k.stats, LIMITS.daySec)
	]);

	if (n >= LIMITS.ipMax) {
		const level = await store.hit(k.lvl(ip), LIMITS.daySec);
		const seconds = Math.min(LIMITS.baseLockSec * 2 ** (level - 1), LIMITS.maxLockSec);
		await store.setValue(k.lock(ip), String(level), seconds);
		await store.del(k.ip(ip)); // start counting fresh once the lock ends
	}

	if (day >= LIMITS.dayMax) {
		const left = Math.max(await store.ttl(k.day(ip)), 1);
		if ((await store.ttl(k.lock(ip))) < left) await store.setValue(k.lock(ip), 'day', left);
	}

	if (global >= LIMITS.globalMax && (await store.ttl(k.pause)) <= 0) {
		await store.setValue(k.pause, '1', LIMITS.pauseSec);
	}
}

/**
 * A good login clears this IP's short-term failure count.
 * @param {Store} store
 * @param {string} ip
 */
export async function recordSuccess(store, ip) {
	await store.del(k.ip(ip));
}

/**
 * For the admin screen.
 * @param {Store} store
 * @returns {Promise<{ failures24h: number, pausedFor: number }>}
 */
export async function getLoginStats(store) {
	const [failures, pausedFor] = await Promise.all([store.getValue(k.stats), store.ttl(k.pause)]);
	return { failures24h: Number(failures ?? 0), pausedFor };
}
