import { describe, expect, it } from 'vitest';
import { villas } from '$lib/config/villas.js';
import { OUTLINE, project, VIEW, VIEWPORT } from '$lib/config/tenerife.js';
import { smoothClosedPath, spreadPins } from './map-layout.js';

// Photos are 12.5% of the shown map width, exactly as in VillaMap.
const PIN = VIEWPORT.w * 0.125;
const opts = { minDist: PIN, bounds: VIEWPORT, margin: PIN / 2, keepClear: PIN / 2 + 28 };
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

	it('keeps every photo off every real spot, so no dot or ring is hidden', () => {
		const pins = spreadPins(anchors(), opts);
		for (const p of pins) {
			for (const a of anchors()) {
				const d = Math.hypot(p.x - a.x, p.y - a.y);
				expect(d, `${p.id} over the spot of ${a.id}`).toBeGreaterThanOrEqual(opts.keepClear * 0.97);
			}
		}
	});

	it('keeps every pin inside the map', () => {
		for (const p of spreadPins(anchors(), opts)) {
			expect(p.x).toBeGreaterThanOrEqual(VIEWPORT.x + opts.margin - 0.5);
			expect(p.x).toBeLessThanOrEqual(VIEWPORT.x + VIEWPORT.w - opts.margin + 0.5);
			expect(p.y).toBeGreaterThanOrEqual(VIEWPORT.y + opts.margin - 0.5);
			expect(p.y).toBeLessThanOrEqual(VIEWPORT.y + VIEWPORT.h - opts.margin + 0.5);
		}
	});

	it('keeps each pin reasonably near its true position', () => {
		for (const p of spreadPins(anchors(), opts)) {
			expect(Math.hypot(p.x - p.ax, p.y - p.ay)).toBeLessThan(PIN * 4);
		}
	});

	it('is deterministic, and leaves already-spread pins alone', () => {
		expect(spreadPins(anchors(), opts)).toEqual(spreadPins(anchors(), opts));
		const far = [
			{ id: 'a', x: 200, y: 450 },
			{ id: 'b', x: 520, y: 800 }
		];
		// Without the keep-clear rule, photos that already don't touch stay exactly where they are.
		const out = spreadPins(far, { ...opts, keepClear: 0 });
		expect(out.map((p) => [Math.round(p.x), Math.round(p.y)])).toEqual([
			[200, 450],
			[520, 800]
		]);
		// With it, each photo steps just far enough away from its own real spot, and no further.
		const clear = spreadPins(far, opts);
		for (const c of clear) {
			expect(Math.hypot(c.x - c.ax, c.y - c.ay)).toBeCloseTo(opts.keepClear, 0);
		}
	});

	it('separates villas at exactly the same spot', () => {
		const same = [
			{ id: 'a', x: 300, y: 600 },
			{ id: 'b', x: 300, y: 600 },
			{ id: 'c', x: 300, y: 600 }
		];
		const out = spreadPins(same, opts);
		expect(Math.hypot(out[0].x - out[1].x, out[0].y - out[1].y)).toBeGreaterThan(PIN * 0.8);
	});
});

describe('the zoomed map window', () => {
	it('has the same proportions as the whole drawing', () => {
		expect(VIEWPORT.w / VIEWPORT.h).toBeCloseTo(VIEW.w / VIEW.h, 2);
	});
	it('stays inside the drawing', () => {
		expect(VIEWPORT.x).toBeGreaterThanOrEqual(0);
		expect(VIEWPORT.y).toBeGreaterThanOrEqual(0);
		expect(VIEWPORT.x + VIEWPORT.w).toBeLessThanOrEqual(VIEW.w);
		expect(VIEWPORT.y + VIEWPORT.h).toBeLessThanOrEqual(VIEW.h);
	});
	it('contains every villa, with room for its photo (none can fall off the edge)', () => {
		for (const v of villas) {
			const p = project(v.coords);
			expect(p.x, v.id).toBeGreaterThan(VIEWPORT.x + PIN);
			expect(p.x, v.id).toBeLessThan(VIEWPORT.x + VIEWPORT.w - PIN);
			expect(p.y, v.id).toBeGreaterThan(VIEWPORT.y + PIN);
			expect(p.y, v.id).toBeLessThan(VIEWPORT.y + VIEWPORT.h - PIN);
		}
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
