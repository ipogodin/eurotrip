import { describe, expect, it } from 'vitest';
import {
	formatDateRange,
	formatAgo,
	formatDeadline,
	formatMoney,
	formatRemaining,
	pacificToUtc,
	utcToPacificInput
} from './time.js';

const T = Date.parse('2026-10-10T16:30:00Z');

describe('formatRemaining', () => {
	it('shows days and hours when far away', () => {
		expect(formatRemaining(T - (86400 + 14 * 3600) * 1000, T)).toMatchObject({
			text: '1d 14h',
			urgent: false
		});
	});
	it('switches to hours and minutes and flags urgency under 24h', () => {
		expect(formatRemaining(T - (2 * 3600 + 5 * 60) * 1000, T)).toMatchObject({
			text: '2h 05m',
			urgent: true
		});
	});
	it('shows mm:ss in the last five minutes', () => {
		expect(formatRemaining(T - 4 * 60_000 - 59_000, T)).toMatchObject({
			text: '04:59',
			final: true
		});
	});
	it('reports closed at and after the deadline', () => {
		expect(formatRemaining(T, T)).toMatchObject({ text: 'Voting closed', closed: true });
		expect(formatRemaining(T + 1000, T).closed).toBe(true);
	});
});

describe('formatDeadline', () => {
	it('shows Pacific time with the zone', () => {
		expect(formatDeadline('2026-10-10T16:30:00Z')).toBe('Sat, Oct 10, 9:30 AM PDT');
	});
	it('switches to PST after the DST change', () => {
		expect(formatDeadline('2026-11-02T17:30:00Z')).toBe('Mon, Nov 2, 9:30 AM PST');
	});
});

describe('formatDateRange', () => {
	it('collapses the month inside one month', () => {
		expect(formatDateRange({ start: '2027-02-13', end: '2027-02-22' })).toBe('Feb 13 – 22');
	});
	it('names both months across a month boundary', () => {
		expect(formatDateRange({ start: '2027-02-20', end: '2027-03-01' })).toBe('Feb 20 – Mar 1');
	});
});

describe('formatMoney', () => {
	it('rounds to whole units with grouping', () => {
		expect(formatMoney(6719, 'USD')).toBe('$6,719');
		expect(formatMoney(746.6, 'USD')).toBe('$747');
	});
});

describe('pacificToUtc', () => {
	it('uses PDT (UTC-7) before the clocks change', () => {
		expect(pacificToUtc('2026-10-10T09:30')).toBe('2026-10-10T16:30:00.000Z');
	});
	it('uses PST (UTC-8) after the clocks change (Nov 1, 2026, 2 am)', () => {
		expect(pacificToUtc('2026-10-31T23:59')).toBe('2026-11-01T06:59:00.000Z'); // still PDT
		expect(pacificToUtc('2026-11-01T12:00')).toBe('2026-11-01T20:00:00.000Z'); // PST
		expect(pacificToUtc('2026-11-02T09:30')).toBe('2026-11-02T17:30:00.000Z');
	});
	it('gives a single real instant for the repeated 1:30 am on Nov 1', () => {
		const iso = /** @type {string} */ (pacificToUtc('2026-11-01T01:30'));
		expect(['2026-11-01T08:30:00.000Z', '2026-11-01T09:30:00.000Z']).toContain(iso);
	});
	it('gives a real instant for the skipped 2:30 am on Mar 14, 2027', () => {
		expect(pacificToUtc('2027-03-14T02:30')).not.toBeNull();
		expect(pacificToUtc('2027-03-14T12:00')).toBe('2027-03-14T19:00:00.000Z'); // PDT again
	});
	it('rejects things that are not a real date and time', () => {
		for (const bad of [
			'',
			'soon',
			'2026-10-10',
			'2026-10-10 09:30',
			'2026-02-30T09:30',
			'2026-10-10T25:00',
			null,
			5
		]) {
			expect(pacificToUtc(bad)).toBeNull();
		}
	});
});

describe('utcToPacificInput', () => {
	it('round-trips with pacificToUtc', () => {
		for (const local of ['2026-10-10T09:30', '2026-11-02T09:30', '2027-02-13T00:00']) {
			expect(utcToPacificInput(/** @type {string} */ (pacificToUtc(local)))).toBe(local);
		}
	});
	it('shows the default deadline as 9:30 am Pacific', () => {
		expect(utcToPacificInput('2026-10-10T16:30:00Z')).toBe('2026-10-10T09:30');
	});
});

describe('formatAgo', () => {
	const now = Date.parse('2026-10-09T18:00:00Z');
	const ago = (/** @type {number} */ ms) => new Date(now - ms).toISOString();
	it('says just now for the last minute, and for a slightly-ahead clock', () => {
		expect(formatAgo(ago(20_000), now)).toBe('just now');
		expect(formatAgo(new Date(now + 30_000).toISOString(), now)).toBe('just now');
	});
	it('counts minutes, then hours', () => {
		expect(formatAgo(ago(5 * 60_000), now)).toBe('5 min ago');
		expect(formatAgo(ago(59 * 60_000), now)).toBe('59 min ago');
		expect(formatAgo(ago(60 * 60_000), now)).toBe('1 h ago');
		expect(formatAgo(ago(23 * 3_600_000), now)).toBe('23 h ago');
	});
	it('switches to a date after a day, and copes with junk', () => {
		expect(formatAgo(ago(30 * 3_600_000), now)).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2}/);
		expect(formatAgo('not a date', now)).toBe('');
	});
});
