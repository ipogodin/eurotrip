/** Two lowercase words joined by one dash, e.g. `copper-heron`. */
export const PHRASE_FORMAT = /^[a-z]+-[a-z]+$/;

/**
 * Canonical form of an invite phrase. Forgiving about how people type it on
 * a phone: any case, spaces, underscores, or typographic dashes between the
 * words all become a single `-`.
 * @param {unknown} input
 * @returns {string}
 */
export function normalizePhrase(input) {
	return String(input ?? '')
		.normalize('NFKC')
		.trim()
		.toLowerCase()
		.replace(/[\s_‐-―−]+/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * @param {string} normalized
 * @returns {boolean}
 */
export function isValidPhrase(normalized) {
	return PHRASE_FORMAT.test(normalized);
}
