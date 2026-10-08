/**
 * @typedef {{ id: string, name: string, short: string, votes?: number }} PublicMember  `votes` = point budget
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
 * CSS color for a member (uses the --m1..--m8 tokens).
 * @param {string} id
 */
export function memberColor(id) {
	return `var(--m${hueIndex(id)})`;
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
