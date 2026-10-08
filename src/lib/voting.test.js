import { describe, expect, it } from 'vitest';
import {
	canIncrement,
	effectiveDeadline,
	spent,
	tally,
	validateBallot,
	votingState,
	withPoints
} from './voting.js';

const villaIds = ['a', 'b', 'c', 'd'];
const open = { villaIds, state: /** @type {const} */ ('open') };
const DEADLINE = '2026-10-10T16:30:00Z';
const T = Date.parse(DEADLINE);

describe('votingState / effectiveDeadline', () => {
	it('is open before, closed at and after the deadline', () => {
		expect(votingState(T - 1, DEADLINE, null)).toBe('open');
		expect(votingState(T, DEADLINE, null)).toBe('closed');
		expect(votingState(T + 5000, DEADLINE, undefined)).toBe('closed');
	});
	it('a winner wins over everything, even before the deadline', () => {
		expect(votingState(T - 100000, DEADLINE, 'a')).toBe('decided');
		expect(votingState(T + 100000, DEADLINE, 'a')).toBe('decided');
	});
	it('the admin override replaces the default', () => {
		expect(effectiveDeadline('2026-10-11T00:00:00Z', DEADLINE)).toBe('2026-10-11T00:00:00Z');
		expect(effectiveDeadline(null, DEADLINE)).toBe(DEADLINE);
		expect(effectiveDeadline('', DEADLINE)).toBe(DEADLINE);
	});
});

describe('validateBallot', () => {
	it('accepts a legal ballot and drops zeros', () => {
		const r = validateBallot({ a: 3, b: 1, c: 0 }, open);
		expect(r).toEqual({ ok: true, ballot: { a: 3, b: 1 } });
	});
	it('accepts an empty ballot (clearing all votes)', () => {
		expect(validateBallot({}, open)).toEqual({ ok: true, ballot: {} });
	});
	it('accepts exactly the budget, rejects one over', () => {
		expect(validateBallot({ a: 3, b: 3 }, open).ok).toBe(true);
		expect(validateBallot({ a: 3, b: 3, c: 1 }, open)).toMatchObject({ ok: false, code: 'budget' });
	});
	it('rejects more than 3 on one villa', () => {
		expect(validateBallot({ a: 4 }, open)).toMatchObject({ ok: false, code: 'points' });
	});
	it('rejects unknown villas, including prototype keys', () => {
		expect(validateBallot({ zzz: 1 }, open)).toMatchObject({ ok: false, code: 'unknown-villa' });
		const proto = JSON.parse('{"__proto__": 1}');
		expect(validateBallot(proto, open)).toMatchObject({ ok: false, code: 'unknown-villa' });
		expect(validateBallot({ constructor: 1 }, open).ok).toBe(false);
	});
	it('rejects non-integers, negatives, strings, NaN and Infinity', () => {
		for (const bad of [1.5, -1, '2', NaN, Infinity, null, true, [1]]) {
			expect(validateBallot({ a: bad }, open).ok).toBe(false);
		}
	});
	it('rejects non-object ballots', () => {
		for (const bad of [null, undefined, 'a', 5, [1, 2]]) {
			expect(validateBallot(bad, open)).toMatchObject({ ok: false, code: 'shape' });
		}
	});
	it('refuses everything once closed or decided', () => {
		expect(validateBallot({ a: 1 }, { villaIds, state: 'closed' })).toMatchObject({
			ok: false,
			code: 'closed'
		});
		expect(validateBallot({ a: 1 }, { villaIds, state: 'decided' })).toMatchObject({
			ok: false,
			code: 'decided'
		});
	});
	it('honors custom limits', () => {
		expect(validateBallot({ a: 2 }, { ...open, max: 1 }).ok).toBe(false);
		expect(validateBallot({ a: 1, b: 1 }, { ...open, budget: 1 }).ok).toBe(false);
	});
});

describe('ballot helpers', () => {
	it('spent adds points up', () => {
		expect(spent({})).toBe(0);
		expect(spent({ a: 3, b: 2 })).toBe(5);
	});
	it('canIncrement respects per-villa max and total budget', () => {
		expect(canIncrement({ a: 3 }, 'a')).toBe(false);
		expect(canIncrement({ a: 3, b: 3 }, 'c')).toBe(false);
		expect(canIncrement({ a: 3, b: 2 }, 'c')).toBe(true);
		expect(canIncrement({}, 'a')).toBe(true);
	});
	it('withPoints copies, sets and removes', () => {
		const base = { a: 1 };
		expect(withPoints(base, 'b', 2)).toEqual({ a: 1, b: 2 });
		expect(withPoints(base, 'a', 0)).toEqual({});
		expect(base).toEqual({ a: 1 });
	});
});

describe('tally', () => {
	const villas = [
		{ id: 'a', name: 'Casa Alba' },
		{ id: 'b', name: 'Villa Brisa' },
		{ id: 'c', name: 'Casa Coral' },
		{ id: 'd', name: 'Dunas' }
	];
	const members = [{ id: 'ilia' }, { id: 'anna' }, { id: 'tom' }];

	it('totals, ranks (ties share a rank) and sorts voters', () => {
		const t = tally({ ilia: { a: 3, b: 1 }, anna: { a: 1, b: 3, c: 1 }, tom: {} }, villas, members);
		expect(t.byVilla.map((v) => [v.villaId, v.total, v.rank])).toEqual([
			['a', 4, 1],
			['b', 4, 1],
			['c', 1, 3],
			['d', 0, null]
		]);
		expect(t.byVilla[0].voters).toEqual([
			{ memberId: 'ilia', points: 3 },
			{ memberId: 'anna', points: 1 }
		]);
	});

	it('per person: picks sorted, points left, and who has not voted', () => {
		const t = tally({ ilia: { a: 1, b: 3 }, anna: {} }, villas, members);
		expect(t.byPerson[0]).toEqual({
			memberId: 'ilia',
			spent: 4,
			left: 2,
			picks: [
				{ villaId: 'b', points: 3 },
				{ villaId: 'a', points: 1 }
			]
		});
		expect(t.notVotedYet).toEqual(['anna', 'tom']);
	});

	it('ignores unknown villas and members, and empty input', () => {
		const t = tally({ ghost: { a: 3 }, ilia: { gone: 3, a: 1 } }, villas, members);
		expect(t.byVilla.find((v) => v.villaId === 'a')?.total).toBe(1);
		expect(t.byPerson[0].spent).toBe(1);
		const empty = tally({}, villas, members);
		expect(empty.byVilla.every((v) => v.total === 0 && v.rank === null)).toBe(true);
		expect(empty.notVotedYet).toHaveLength(3);
	});

	it('breaks total ties by name for a stable order', () => {
		const t = tally({ ilia: { b: 1, a: 1 } }, villas, members);
		expect(t.byVilla.slice(0, 2).map((v) => v.villaId)).toEqual(['a', 'b']);
	});
});
