import { describe, expect, it } from 'vitest';
import { toHash } from './upstash.js';

describe('toHash', () => {
	it('converts a flat HGETALL array into an object', () => {
		expect(toHash(['a', '1', 'b', 'x'])).toEqual({ a: '1', b: 'x' });
	});
	it('passes objects through and treats null/empty as {}', () => {
		expect(toHash({ a: '1' })).toEqual({ a: '1' });
		expect(toHash(null)).toEqual({});
		expect(toHash([])).toEqual({});
	});
});
