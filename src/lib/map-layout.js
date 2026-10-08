/**
 * Place photo pins on the map. Villas that are really close together (five of
 * ours sit within a few km) would hide each other, so each pin starts at its
 * true spot and is pushed just far enough from its neighbours to stay fully
 * visible. Positions are therefore approximate, as intended; the true spot is
 * kept so a thin line can point back to it.
 */

/**
 * @param {{ id: string, x: number, y: number }[]} anchors  true positions
 * @param {{ minDist: number, width: number, height: number, margin: number }} opts
 * @returns {{ id: string, x: number, y: number, ax: number, ay: number }[]}
 */
export function spreadPins(anchors, { minDist, width, height, margin }) {
	const pts = anchors.map((a) => ({ id: a.id, ax: a.x, ay: a.y, x: a.x, y: a.y }));
	const clamp = () => {
		for (const p of pts) {
			p.x = Math.min(width - margin, Math.max(margin, p.x));
			p.y = Math.min(height - margin, Math.max(margin, p.y));
		}
	};

	/** Push every overlapping pair apart. @returns {boolean} whether anything moved */
	const separate = () => {
		let moved = false;
		for (let i = 0; i < pts.length; i++) {
			for (let j = i + 1; j < pts.length; j++) {
				let dx = pts[j].x - pts[i].x;
				let dy = pts[j].y - pts[i].y;
				let d = Math.hypot(dx, dy);
				if (d >= minDist) continue;
				if (d < 1e-6) {
					// Identical spots: separate along a fixed, per-pair angle (deterministic).
					const angle = (i * 7 + j * 13) * 2.399963;
					dx = Math.cos(angle);
					dy = Math.sin(angle);
					d = 1;
				}
				const push = (minDist - d) / 2 + 0.01;
				pts[i].x -= (dx / d) * push;
				pts[i].y -= (dy / d) * push;
				pts[j].x += (dx / d) * push;
				pts[j].y += (dy / d) * push;
				moved = true;
			}
		}
		return moved;
	};

	// Phase 1: separate, with a weak pull back toward each true spot so pins
	// stay near home instead of drifting apart.
	for (let n = 0; n < 300; n++) {
		separate();
		for (const p of pts) {
			p.x += (p.ax - p.x) * 0.03;
			p.y += (p.ay - p.y) * 0.03;
		}
		clamp();
	}
	// Phase 2: no pull, so nothing overlaps at the end.
	for (let n = 0; n < 400; n++) {
		const moved = separate();
		clamp();
		if (!moved) break;
	}
	return pts;
}

/**
 * A closed, smooth SVG path through the points (Catmull-Rom → cubic Bézier).
 * @param {{ x: number, y: number }[]} points
 * @param {number} [tension]
 */
export function smoothClosedPath(points, tension = 0.5) {
	const n = points.length;
	if (n < 3) return '';
	const f = (/** @type {number} */ v) => Math.round(v * 10) / 10;
	let d = `M${f(points[0].x)} ${f(points[0].y)}`;
	for (let i = 0; i < n; i++) {
		const p0 = points[(i - 1 + n) % n];
		const p1 = points[i];
		const p2 = points[(i + 1) % n];
		const p3 = points[(i + 2) % n];
		const c1x = p1.x + ((p2.x - p0.x) * tension) / 3;
		const c1y = p1.y + ((p2.y - p0.y) * tension) / 3;
		const c2x = p2.x - ((p3.x - p1.x) * tension) / 3;
		const c2y = p2.y - ((p3.y - p1.y) * tension) / 3;
		d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2.x)} ${f(p2.y)}`;
	}
	return `${d}Z`;
}
