import { describe, expect, it } from 'vitest';
import { formatDateRange, formatDeadline, formatMoney, formatRemaining } from './time.js';

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
