import { describe, expect, it } from 'vitest';
import { formatRemaining } from './time.js';

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
