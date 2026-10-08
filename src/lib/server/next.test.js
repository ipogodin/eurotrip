import { describe, expect, it } from 'vitest';
import { safeNext } from './next.js';

describe('safeNext', () => {
	it('accepts same-site paths with query strings', () => {
		expect(safeNext('/vote')).toBe('/vote');
		expect(safeNext('/villas/casa-1?view=map')).toBe('/villas/casa-1?view=map');
	});
	it('rejects anything that could leave the site or loop', () => {
		for (const bad of [
			'//evil.com',
			'https://evil.com',
			'/\\evil.com',
			'javascript:alert(1)',
			'vote',
			'',
			'/',
			'/a\nb',
			null,
			undefined,
			42
		]) {
			expect(safeNext(bad)).toBeNull();
		}
	});
});
