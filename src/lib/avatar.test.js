import { describe, expect, it } from 'vitest';
import { AVATAR_PHRASES } from './config/avatar-phrases.js';
import { currentVersion, nextVersion, parsePhrases, pickPhrase } from './avatar.js';

describe('parsePhrases', () => {
	it('keeps one phrase per line, trimmed, skipping blanks and # comments', () => {
		expect(parsePhrases('# note\n\n  Neh, better. \r\nSecond one\n#another\n')).toEqual([
			'Neh, better.',
			'Second one'
		]);
	});
	it('gives an empty list for an empty file', () => {
		expect(parsePhrases('')).toEqual([]);
		expect(parsePhrases('# only a comment')).toEqual([]);
	});
});

describe('the real phrase file', () => {
	it('has several usable phrases', () => {
		expect(AVATAR_PHRASES.length).toBeGreaterThanOrEqual(5);
		expect(new Set(AVATAR_PHRASES).size).toBe(AVATAR_PHRASES.length); // no duplicates
		for (const p of AVATAR_PHRASES) expect(p.length).toBeLessThan(120);
	});
});

describe('pickPhrase', () => {
	const list = ['a', 'b', 'c'];
	it('picks across the whole list', () => {
		expect(pickPhrase(list, { random: () => 0 })).toBe('a');
		expect(pickPhrase(list, { random: () => 0.5 })).toBe('b');
		expect(pickPhrase(list, { random: () => 0.999 })).toBe('c');
	});
	it('never repeats the previous phrase when there is a choice', () => {
		for (const r of [0, 0.34, 0.67, 0.999]) {
			expect(pickPhrase(list, { random: () => r, previous: 'b' })).not.toBe('b');
		}
	});
	it('copes with one phrase, no phrases and random() = 1', () => {
		expect(pickPhrase(['only'], { previous: 'only' })).toBe('only');
		expect(pickPhrase([])).toMatch(/better/);
		expect(pickPhrase(list, { random: () => 1 })).toBe('c');
	});
	it('really is random with the default generator', () => {
		const seen = new Set(Array.from({ length: 200 }, () => pickPhrase(list)));
		expect(seen.size).toBe(3);
	});
});

describe('photo versions', () => {
	it('starts on photo 1 and moves up one at a time', () => {
		expect(nextVersion(undefined, 3)).toEqual({ version: 2, changed: true });
		expect(nextVersion(2, 3)).toEqual({ version: 3, changed: true });
	});
	it('goes round to the first photo after the last one', () => {
		expect(nextVersion(3, 3)).toEqual({ version: 1, changed: true });
		expect(nextVersion(2, 2)).toEqual({ version: 1, changed: true });
		expect(nextVersion(9, 3)).toEqual({ version: 1, changed: true }); // stored value above the count
	});
	it('with a single photo there is nothing to change to', () => {
		expect(nextVersion(1, 1)).toEqual({ version: 1, changed: false });
	});
	it('falls back safely on missing, garbled or too-high stored values', () => {
		expect(currentVersion(undefined, 2)).toBe(1);
		expect(currentVersion('abc', 2)).toBe(1);
		expect(currentVersion(0, 2)).toBe(1);
		expect(currentVersion(-4, 2)).toBe(1);
		expect(currentVersion(9, 2)).toBe(2);
		expect(currentVersion('2', 3)).toBe(2);
		expect(currentVersion(2.9, 5)).toBe(2);
	});
	it('handles a member with zero known photos as version 1', () => {
		expect(currentVersion(5, 0)).toBe(1);
		expect(nextVersion(1, 0)).toEqual({ version: 1, changed: false });
	});
});
