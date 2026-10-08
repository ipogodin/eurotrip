import { describe, expect, it } from 'vitest';
import { villas } from '$lib/config/villas.js';
import { OUTLINE, project, VIEW } from '$lib/config/tenerife.js';
import { smoothClosedPath, spreadPins } from './map-layout.js';

const opts = { minDist: 125, width: VIEW.w, height: VIEW.h, margin: 63 };
const anchors = () => villas.map((v) => ({ id: v.id, ...project(v.coords) }));

describe('spreadPins', () => {
	it('keeps every pin clear of every other (nothing hides a photo)', () => {
		const pins = spreadPins(anchors(), opts);
		for (let i = 0; i < pins.length; i++) {
			for (let j = i + 1; j < pins.length; j++) {
				const d = Math.hypot(pins[i].x - pins[j].x, pins[i].y - pins[j].y);
				expect(d, `${pins[i].id} vs ${pins[j].id}`).toBeGreaterThanOrEqual(opts.minDist * 0.97);
			}
		}
	});

	it('keeps every pin inside the map', () => {
		for (const p of spreadPins(anchors(), opts)) {
			expect(p.x).toBeGreaterThanOrEqual(opts.margin - 0.5);
			expect(p.x).toBeLessThanOrEqual(VIEW.w - opts.margin + 0.5);
			expect(p.y).toBeGreaterThanOrEqual(opts.margin - 0.5);
			expect(p.y).toBeLessThanOrEqual(VIEW.h - opts.margin + 0.5);
		}
	});

	it('keeps each pin reasonably near its true position', () => {
		for (const p of spreadPins(anchors(), opts)) {
			expect(Math.hypot(p.x - p.ax, p.y - p.ay)).toBeLessThan(350);
		}
	});

	it('is deterministic, and leaves already-spread pins alone', () => {
		expect(spreadPins(anchors(), opts)).toEqual(spreadPins(anchors(), opts));
		const far = [
			{ id: 'a', x: 200, y: 200 },
			{ id: 'b', x: 700, y: 600 }
		];
		const out = spreadPins(far, opts);
		expect(out.map((p) => [Math.round(p.x), Math.round(p.y)])).toEqual([
			[200, 200],
			[700, 600]
		]);
	});

	it('separates villas at exactly the same spot', () => {
		const same = [
			{ id: 'a', x: 500, y: 500 },
			{ id: 'b', x: 500, y: 500 },
			{ id: 'c', x: 500, y: 500 }
		];
		const out = spreadPins(same, opts);
		expect(Math.hypot(out[0].x - out[1].x, out[0].y - out[1].y)).toBeGreaterThan(100);
	});
});

describe('Tenerife outline', () => {
	it('fits inside the drawing area', () => {
		for (const p of OUTLINE) {
			expect(p.x).toBeGreaterThan(0);
			expect(p.x).toBeLessThan(VIEW.w);
			expect(p.y).toBeGreaterThan(0);
			expect(p.y).toBeLessThan(VIEW.h);
		}
	});

	it('has every villa on or near the island (approximate positions)', () => {
		// Ray-casting point-in-polygon with a small tolerance via 4 offsets.
		const inside = (/** @type {{x:number,y:number}} */ pt) => {
			let c = false;
			for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
				const a = OUTLINE[i];
				const b = OUTLINE[j];
				if (a.y > pt.y !== b.y > pt.y && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x)
					c = !c;
			}
			return c;
		};
		for (const v of villas) {
			const p = project(v.coords);
			const near = [
				[0, 0],
				[25, 0],
				[-25, 0],
				[0, 25],
				[0, -25]
			].some(([dx, dy]) => inside({ x: p.x + dx, y: p.y + dy }));
			expect(near, v.id).toBe(true);
		}
	});
});

describe('smoothClosedPath', () => {
	it('makes a closed path through all points', () => {
		const d = smoothClosedPath([
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
			{ x: 100, y: 100 },
			{ x: 0, y: 100 }
		]);
		expect(d.startsWith('M0 0')).toBe(true);
		expect(d.endsWith('Z')).toBe(true);
		expect(d.match(/C/g)).toHaveLength(4);
	});
	it('returns nothing for fewer than 3 points', () => {
		expect(smoothClosedPath([{ x: 0, y: 0 }])).toBe('');
	});
});
