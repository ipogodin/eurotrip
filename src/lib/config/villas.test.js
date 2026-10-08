import { describe, expect, it } from 'vitest';
import { findVilla, villas } from './villas.js';

describe('villas config', () => {
	it('has 6-15 candidates', () => {
		expect(villas.length).toBeGreaterThanOrEqual(6);
		expect(villas.length).toBeLessThanOrEqual(15);
	});

	it('has unique, URL-safe ids', () => {
		const ids = villas.map((v) => v.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
	});

	it.each(villas.map((v) => [v.id, v]))('%s has sane data', (_id, v) => {
		expect(v.name.trim()).not.toBe('');
		expect(v.bedrooms).toBeGreaterThan(0);
		expect(v.sleeps).toBeGreaterThanOrEqual(v.bedrooms);
		expect(v.price.total).toBeGreaterThan(0);
		expect(v.price.nights).toBeGreaterThan(0);
		const [lat, lng] = v.coords;
		expect(lat).toBeGreaterThan(27); // Canary Islands bounding box
		expect(lat).toBeLessThan(30);
		expect(lng).toBeGreaterThan(-19);
		expect(lng).toBeLessThan(-13);
		expect(v.url).toMatch(/^https?:\/\//);
		for (const p of v.photos) {
			expect(p.src).toBe(`/villas/${v.id}/${p.src.split('/').pop()}`);
			expect(p.width).toBeGreaterThan(0);
		}
	});

	it('findVilla looks up by id', () => {
		expect(findVilla(villas[0].id)).toBe(villas[0]);
		expect(findVilla('nope')).toBeUndefined();
	});
});
