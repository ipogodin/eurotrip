import { beforeEach, describe, expect, it } from 'vitest';
import {
	closeNow,
	currentStatus,
	pickWinner,
	removeVilla,
	resetAllVotes,
	restoreVilla,
	setDeadline,
	undoWinner
} from './admin-actions.js';
import { createMemoryStore } from './store/memory.js';

const NOW = Date.parse('2026-10-09T18:00:00Z'); // before the default deadline (Oct 10, 16:30Z)
const HOUR = 3_600_000;
const members = ['illia', 'anna', 'tom'];
const all = ['a', 'b', 'c', 'd'];

/** @type {ReturnType<typeof createMemoryStore>} */
let store;
beforeEach(() => {
	store = createMemoryStore();
});

describe('setDeadline', () => {
	it('extends an open vote', async () => {
		const r = await setDeadline(store, new Date(NOW + 48 * HOUR).toISOString(), NOW);
		expect(r).toMatchObject({ ok: true });
		expect((await currentStatus(store, NOW)).deadline).toBe(
			new Date(NOW + 48 * HOUR).toISOString()
		);
	});
	it('reopens a closed vote', async () => {
		await store.setVoting({ deadline: new Date(NOW - HOUR).toISOString() });
		expect((await currentStatus(store, NOW)).state).toBe('closed');
		const r = await setDeadline(store, new Date(NOW + HOUR).toISOString(), NOW);
		expect(r).toMatchObject({ ok: true, message: 'Voting is open again.' });
		expect((await currentStatus(store, NOW)).state).toBe('open');
	});
	it('refuses the past, junk, absurdly far dates and a decided vote', async () => {
		expect(await setDeadline(store, new Date(NOW - 1).toISOString(), NOW)).toMatchObject({
			ok: false
		});
		expect(await setDeadline(store, 'soon', NOW)).toMatchObject({ ok: false });
		expect(await setDeadline(store, '2062-01-01T00:00:00Z', NOW)).toMatchObject({ ok: false });
		await pickWinner(store, 'a', all, NOW);
		expect(await setDeadline(store, new Date(NOW + HOUR).toISOString(), NOW)).toMatchObject({
			ok: false
		});
	});
});

describe('closeNow', () => {
	it('closes an open vote immediately', async () => {
		expect(await closeNow(store, NOW)).toMatchObject({ ok: true });
		expect((await currentStatus(store, NOW)).state).toBe('closed');
	});
	it('does nothing when it is not open', async () => {
		await closeNow(store, NOW);
		expect(await closeNow(store, NOW)).toMatchObject({ ok: false });
	});
});

describe('winner', () => {
	it('picking a winner ends voting, undoing it goes back to the deadline', async () => {
		expect(await pickWinner(store, 'b', all, NOW)).toMatchObject({ ok: true });
		expect(await currentStatus(store, NOW)).toMatchObject({ state: 'decided', winnerId: 'b' });
		expect(await undoWinner(store, NOW)).toMatchObject({ ok: true });
		expect(await currentStatus(store, NOW)).toMatchObject({ state: 'open', winnerId: null });
	});
	it('only villas on the list can win', async () => {
		expect(await pickWinner(store, 'zzz', all, NOW)).toMatchObject({ ok: false });
		expect(await pickWinner(store, 'd', ['a', 'b', 'c'], NOW)).toMatchObject({ ok: false });
	});
	it('cannot undo a winner that is not there', async () => {
		expect(await undoWinner(store, NOW)).toMatchObject({ ok: false });
	});
});

describe('resetAllVotes', () => {
	it("empties everyone's ballot and records when", async () => {
		await store.setBallot('illia', { a: 3, b: 2 });
		await store.setBallot('anna', { c: 1 });
		expect(await resetAllVotes(store, members, NOW)).toMatchObject({ ok: true });
		expect(await store.getBallots(members)).toEqual({ illia: {}, anna: {}, tom: {} });
		expect((await store.getVoting()).resetAt).toBe(new Date(NOW).toISOString());
	});
	it('leaves the deadline and the removed list alone', async () => {
		await store.setVoting({ deadline: new Date(NOW + HOUR).toISOString(), removed: ['d'] });
		await resetAllVotes(store, members, NOW);
		const v = await store.getVoting();
		expect(v.deadline).toBe(new Date(NOW + HOUR).toISOString());
		expect(v.removed).toEqual(['d']);
	});
	it('is refused once a winner is picked', async () => {
		await store.setBallot('illia', { a: 3 });
		await pickWinner(store, 'a', all, NOW);
		expect(await resetAllVotes(store, members, NOW)).toMatchObject({ ok: false });
		expect((await store.getBallots(['illia'])).illia).toEqual({ a: 3 });
	});
});

describe('removeVilla', () => {
	const ctx = (/** @type {string} */ villaId) => ({
		villaId,
		allVillaIds: all,
		memberIds: members,
		now: NOW
	});

	it('takes the villa off the list and gives its points back to the voters', async () => {
		await store.setBallot('illia', { a: 3, b: 2 });
		await store.setBallot('anna', { b: 3, c: 1 });
		await store.setBallot('tom', { c: 2 });
		const r = await removeVilla(store, ctx('b'));
		expect(r).toMatchObject({ ok: true });
		expect(/** @type {any} */ (r).returned).toEqual([
			{ memberId: 'illia', points: 2 },
			{ memberId: 'anna', points: 3 }
		]);
		expect(await store.getBallots(members)).toEqual({
			illia: { a: 3 }, // 5 spent -> 3: gets 2 back
			anna: { c: 1 }, // 4 spent -> 1: gets 3 back
			tom: { c: 2 }
		});
		expect((await store.getVoting()).removed).toEqual(['b']);
	});
	it('says so when nobody had voted for it', async () => {
		const r = await removeVilla(store, ctx('d'));
		expect(r).toMatchObject({ ok: true, message: 'Villa removed. Nobody had voted for it.' });
	});
	it('refuses unknown, already removed and winning villas', async () => {
		expect(await removeVilla(store, ctx('zzz'))).toMatchObject({ ok: false });
		await removeVilla(store, ctx('d'));
		expect(await removeVilla(store, ctx('d'))).toMatchObject({ ok: false });
		await pickWinner(store, 'a', all, NOW);
		expect(await removeVilla(store, ctx('a'))).toMatchObject({ ok: false });
		expect(await removeVilla(store, ctx('b'))).toMatchObject({ ok: false }); // vote is decided
	});
	it('keeps at least two villas', async () => {
		await removeVilla(store, ctx('c'));
		await removeVilla(store, ctx('d'));
		expect(await removeVilla(store, ctx('b'))).toMatchObject({
			ok: false,
			error: 'At least 2 villas must stay on the list.'
		});
	});
});

describe('restoreVilla', () => {
	it('puts it back with no votes and does not resurrect returned points', async () => {
		await store.setBallot('illia', { a: 2, b: 3 });
		await removeVilla(store, { villaId: 'b', allVillaIds: all, memberIds: members, now: NOW });
		expect(await restoreVilla(store, 'b')).toMatchObject({ ok: true });
		expect((await store.getVoting()).removed).toEqual([]);
		expect((await store.getBallots(['illia'])).illia).toEqual({ a: 2 });
	});
	it('refuses a villa that is not removed', async () => {
		expect(await restoreVilla(store, 'a')).toMatchObject({ ok: false });
	});
});
