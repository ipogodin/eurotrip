import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStore } from './memory.js';

describe('memory store', () => {
	/** @type {ReturnType<typeof createMemoryStore>} */
	let store;
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-09T00:00:00Z'));
		store = createMemoryStore();
	});
	afterEach(() => vi.useRealTimers());

	it('stores and replaces whole ballots', async () => {
		await store.setBallot('a', { v1: 3, v2: 1 });
		await store.setBallot('b', { v2: 2 });
		expect(await store.getBallots(['a', 'b', 'c'])).toEqual({
			a: { v1: 3, v2: 1 },
			b: { v2: 2 },
			c: {}
		});
		await store.setBallot('a', { v3: 1 });
		expect((await store.getBallots(['a'])).a).toEqual({ v3: 1 });
		await store.setBallot('a', {});
		expect((await store.getBallots(['a'])).a).toEqual({});
	});

	it('does not leak internal state through returned ballots', async () => {
		await store.setBallot('a', { v1: 1 });
		const got = await store.getBallots(['a']);
		got.a.v1 = 3;
		expect((await store.getBallots(['a'])).a.v1).toBe(1);
	});

	it('voting deadline override can be set and cleared', async () => {
		expect(await store.getVoting()).toEqual({ deadline: null, removed: [], resetAt: null });
		await store.setVoting({ deadline: '2026-10-11T00:00:00Z' });
		expect((await store.getVoting()).deadline).toBe('2026-10-11T00:00:00Z');
		await store.setVoting({ deadline: null });
		expect((await store.getVoting()).deadline).toBeNull();
	});

	it('trip state merges patches and null clears a field', async () => {
		expect((await store.getTrip()).winnerId).toBeNull();
		await store.setTrip({ winnerId: 'casa', notes: 'hello' });
		await store.setTrip({ dateStart: '2027-02-06' });
		expect(await store.getTrip()).toMatchObject({
			winnerId: 'casa',
			notes: 'hello',
			dateStart: '2027-02-06'
		});
		await store.setTrip({ winnerId: null });
		expect((await store.getTrip()).winnerId).toBeNull();
		expect((await store.getTrip()).notes).toBe('hello');
	});

	it('hit counts within a window and resets after the ttl', async () => {
		expect(await store.hit('k', 60)).toBe(1);
		vi.advanceTimersByTime(30_000);
		expect(await store.hit('k', 60)).toBe(2);
		expect(await store.ttl('k')).toBe(30);
		vi.advanceTimersByTime(31_000);
		expect(await store.hit('k', 60)).toBe(1);
	});

	it('values expire and can be deleted', async () => {
		await store.setValue('lock', '2', 10);
		expect(await store.getValue('lock')).toBe('2');
		vi.advanceTimersByTime(11_000);
		expect(await store.getValue('lock')).toBeNull();
		expect(await store.ttl('lock')).toBe(0);
		await store.setValue('lock', '1', 10);
		await store.del('lock');
		expect(await store.getValue('lock')).toBeNull();
	});

	it('keeps removed villas and the reset time independent of the deadline', async () => {
		await store.setVoting({ deadline: '2026-10-11T00:00:00Z' });
		await store.setVoting({ removed: ['a', 'b'], resetAt: '2026-10-09T01:00:00Z' });
		expect(await store.getVoting()).toEqual({
			deadline: '2026-10-11T00:00:00Z',
			removed: ['a', 'b'],
			resetAt: '2026-10-09T01:00:00Z'
		});
		await store.setVoting({ removed: [], resetAt: null });
		expect(await store.getVoting()).toEqual({
			deadline: '2026-10-11T00:00:00Z',
			removed: [],
			resetAt: null
		});
	});

	it('stores avatar versions, counts and images per member', async () => {
		expect(await store.getAvatarVersions()).toEqual({});
		await store.setAvatarCount('a', 2);
		await store.setAvatarVersion('a', 2);
		await store.setAvatarImage('a', 1, 'AAAA');
		await store.setAvatarImage('a', 2, 'BBBB');
		expect(await store.getAvatarCounts()).toEqual({ a: 2 });
		expect(await store.getAvatarVersions()).toEqual({ a: 2 });
		expect(await store.getAvatarImage('a', 2)).toBe('BBBB');
		expect(await store.getAvatarImage('a', 3)).toBeNull();
		expect(await store.getAvatarImage('b', 1)).toBeNull();
	});
});
