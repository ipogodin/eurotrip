import { describe, expect, it } from 'vitest';
import {
	hueForIndex,
	hueIndex,
	initials,
	memberColor,
	nameFor,
	withCallName
} from './members-ui.js';

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

	it('nameFor uses the private call name only when the entry has one', () => {
		expect(nameFor({ id: 'a', name: 'Anna Example', short: 'Anna' })).toBe('Anna');
		expect(nameFor({ id: 'a', name: 'Anna Example', short: 'Anna', callName: 'Annie' })).toBe(
			'Annie'
		);
	});

	it("withCallName puts the viewer's preferred name on their own entry and nobody else's", () => {
		const members = [
			{ id: 'a', name: 'Anna Example', short: 'Anna' },
			{ id: 'b', name: 'Ben Example', short: 'Ben' }
		];
		const out = withCallName(members, { id: 'a', preferred: 'Annie' });
		expect(out.map(nameFor)).toEqual(['Annie', 'Ben']);
		expect(out[1]).not.toHaveProperty('callName');
		expect(members[0]).not.toHaveProperty('callName'); // the input is not mutated
	});

	it('withCallName leaves everything alone when there is no viewer or no preferred name', () => {
		const members = [{ id: 'a', name: 'Anna Example', short: 'Anna' }];
		expect(withCallName(members, null)).toBe(members);
		expect(withCallName(members, { id: 'a' })).toBe(members);
	});
});
