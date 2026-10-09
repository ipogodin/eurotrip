import { describe, expect, it } from 'vitest';
import { hueForIndex, hueIndex, initials, memberColor } from './members-ui.js';

describe('members-ui', () => {
	it('hueIndex is stable and within 1..8', () => {
		for (const id of ['illia', 'anna', 'x', 'a-very-long-member-id']) {
			const h = hueIndex(id);
			expect(h).toBeGreaterThanOrEqual(1);
			expect(h).toBeLessThanOrEqual(8);
			expect(hueIndex(id)).toBe(h);
		}
	});
	it('initials handles one, two and many words', () => {
		expect(initials('Illia Pogodin')).toBe('IP');
		expect(initials('Anna')).toBe('AN');
		expect(initials('Mary Jane Watson')).toBe('MW');
		expect(initials('  ')).toBe('?');
	});

	it('gives up to 8 members 8 different colours, by roster position', () => {
		const slots = Array.from({ length: 8 }, (_, i) => hueForIndex(i));
		expect(new Set(slots).size).toBe(8);
		expect(Math.min(...slots)).toBe(1);
		expect(Math.max(...slots)).toBe(8);
		expect(hueForIndex(8)).toBe(1); // a 9th member wraps around
	});

	it('memberColor prefers the roster colour and falls back to the id hash', () => {
		expect(memberColor({ id: 'anna', hue: 5 })).toBe('var(--m5)');
		expect(memberColor({ id: 'anna' })).toBe(`var(--m${hueIndex('anna')})`);
		expect(memberColor({ id: 'anna', hue: 99 })).toBe(`var(--m${hueIndex('anna')})`); // out of range
	});
});
