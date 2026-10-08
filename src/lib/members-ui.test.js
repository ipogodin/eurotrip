import { describe, expect, it } from 'vitest';
import { hueIndex, initials } from './members-ui.js';

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
});
