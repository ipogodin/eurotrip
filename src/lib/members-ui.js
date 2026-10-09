/**
 * @typedef {{ id: string, name: string, short: string, votes?: number, hue?: number }} PublicMember
 *   `votes` = point budget; `hue` = avatar colour slot 1-8 (by roster position)
 */

const HUES = 8;

/**
 * Stable avatar color slot (1–8) for a member id.
 * @param {string} id
 * @returns {number}
 */
export function hueIndex(id) {
	let h = 0;
	for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
	return (h % HUES) + 1;
}

/**
 * The colour slot for the n-th member of the roster (0-based): consecutive
 * members get different colours, so up to 8 people never share one.
 * @param {number} index
 */
export function hueForIndex(index) {
	return (index % HUES) + 1;
}

/**
 * CSS color for a member (uses the --m1..--m8 tokens). Prefers the roster
 * position (`hue`), falling back to a hash of the id.
 * @param {{ id: string, hue?: number }} member
 */
export function memberColor({ id, hue }) {
	return `var(--m${hue && hue >= 1 && hue <= HUES ? hue : hueIndex(id)})`;
}

/**
 * Up to two initials from a display name.
 * @param {string} name
 */
export function initials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
