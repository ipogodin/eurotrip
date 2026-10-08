import { describe, expect, it } from 'vitest';
import { isValidPhrase, normalizePhrase } from './phrase.js';

describe('normalizePhrase', () => {
	it.each([
		['copper-heron', 'copper-heron'],
		['  Copper-Heron  ', 'copper-heron'],
		['COPPER HERON', 'copper-heron'],
		['copper_heron', 'copper-heron'],
		['copper   heron', 'copper-heron'],
		['copper--heron', 'copper-heron'],
		['copper–heron', 'copper-heron'],
		['copper—heron', 'copper-heron'],
		['-copper-heron-', 'copper-heron'],
		['ＣＯＰＰＥＲ-heron', 'copper-heron']
	])('%j -> %j', (input, expected) => {
		expect(normalizePhrase(input)).toBe(expected);
	});

	it('handles non-strings safely', () => {
		expect(normalizePhrase(undefined)).toBe('');
		expect(normalizePhrase(null)).toBe('');
		expect(normalizePhrase(42)).toBe('42');
	});
});

describe('isValidPhrase', () => {
	it('accepts exactly two dashed lowercase words', () => {
		expect(isValidPhrase('copper-heron')).toBe(true);
		expect(isValidPhrase('copper')).toBe(false);
		expect(isValidPhrase('a-b-c')).toBe(false);
		expect(isValidPhrase('copper-her0n')).toBe(false);
		expect(isValidPhrase('')).toBe(false);
	});
});
