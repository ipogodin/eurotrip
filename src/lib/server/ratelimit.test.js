import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStore } from './store/memory.js';
import { checkLogin, getLoginStats, LIMITS, recordFailure, recordSuccess } from './ratelimit.js';

describe('login rate limiting', () => {
	/** @type {ReturnType<typeof createMemoryStore>} */
	let store;
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-09T12:00:00Z'));
		store = createMemoryStore();
	});
	afterEach(() => vi.useRealTimers());

	/** @param {string} ip @param {number} n */
	async function fail(ip, n) {
		for (let i = 0; i < n; i++) await recordFailure(store, ip);
	}

	it('allows a fresh IP', async () => {
		expect(await checkLogin(store, '1.1.1.1')).toEqual({ allowed: true, retryAfter: 0 });
	});

	it('allows four failures but locks on the fifth for 15 minutes', async () => {
		await fail('1.1.1.1', 4);
		expect((await checkLogin(store, '1.1.1.1')).allowed).toBe(true);
		await fail('1.1.1.1', 1);
		const r = await checkLogin(store, '1.1.1.1');
		expect(r.allowed).toBe(false);
		expect(r.retryAfter).toBeGreaterThan(890);
		expect(r.retryAfter).toBeLessThanOrEqual(900);
	});

	it('only locks the offending IP', async () => {
		await fail('1.1.1.1', 5);
		expect((await checkLogin(store, '2.2.2.2')).allowed).toBe(true);
	});

	it('unlocks after the lock expires, then doubles on the next lock', async () => {
		await fail('1.1.1.1', 5);
		vi.advanceTimersByTime(901_000);
		expect((await checkLogin(store, '1.1.1.1')).allowed).toBe(true);
		await fail('1.1.1.1', 5);
		const r = await checkLogin(store, '1.1.1.1');
		expect(r.retryAfter).toBeGreaterThan(1790);
		expect(r.retryAfter).toBeLessThanOrEqual(1800);
	});

	it('caps the lock at 24 hours', async () => {
		for (let round = 0; round < 8; round++) {
			await fail('1.1.1.1', 5);
			const { retryAfter } = await checkLogin(store, '1.1.1.1');
			expect(retryAfter).toBeLessThanOrEqual(LIMITS.maxLockSec);
			vi.advanceTimersByTime((retryAfter + 1) * 1000);
		}
	});

	it('a success clears the short-term count', async () => {
		await fail('1.1.1.1', 4);
		await recordSuccess(store, '1.1.1.1');
		await fail('1.1.1.1', 4);
		expect((await checkLogin(store, '1.1.1.1')).allowed).toBe(true);
	});

	it('pauses everyone when failures across IPs pile up', async () => {
		for (let i = 0; i < LIMITS.globalMax; i++) await recordFailure(store, `10.0.0.${i}`);
		const r = await checkLogin(store, '9.9.9.9');
		expect(r.allowed).toBe(false);
		expect(r.retryAfter).toBeLessThanOrEqual(LIMITS.pauseSec);
		vi.advanceTimersByTime((LIMITS.pauseSec + 1) * 1000);
		expect((await checkLogin(store, '9.9.9.9')).allowed).toBe(true);
	});

	it('reports 24h stats for the admin', async () => {
		await fail('1.1.1.1', 3);
		expect(await getLoginStats(store)).toEqual({ failures24h: 3, pausedFor: 0 });
	});
});
