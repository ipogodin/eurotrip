/**
 * Photo versions and the "neh, this one is better" phrases. Pure functions,
 * no server code, so they're unit-tested.
 *
 * A member has photos numbered 1..N (`<id>_1` is their own, `_2` is the first
 * replacement, `_3` a second one, ...). `version` is which one they show now.
 */

/**
 * One phrase per line; blank lines and `#` comments are ignored.
 * @param {string} text
 * @returns {string[]}
 */
export function parsePhrases(text) {
	return text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith('#'));
}

/**
 * A random phrase, never the same one twice in a row when there's a choice.
 * @param {string[]} phrases
 * @param {{ random?: () => number, previous?: string }} [opts]
 * @returns {string}
 */
export function pickPhrase(phrases, { random = Math.random, previous } = {}) {
	if (phrases.length === 0) return 'Neh, this one is better.';
	const pool = phrases.length > 1 ? phrases.filter((p) => p !== previous) : phrases;
	return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}

/**
 * The version to show: the stored one, kept inside 1..latest (a missing,
 * garbled or too-high value falls back safely).
 * @param {unknown} stored
 * @param {number} latest  how many photos this member has
 * @returns {number}
 */
export function currentVersion(stored, latest) {
	const top = Math.max(1, Math.floor(latest) || 1);
	const n = Math.floor(Number(stored));
	return Number.isFinite(n) && n >= 1 ? Math.min(n, top) : 1;
}

/**
 * What happens when the member "updates" their photo: they move up one
 * version, and stay on the last one when there are no more.
 * @param {unknown} stored
 * @param {number} latest
 * @returns {{ version: number, changed: boolean }}
 */
export function nextVersion(stored, latest) {
	const now = currentVersion(stored, latest);
	const version = Math.min(now + 1, Math.max(1, Math.floor(latest) || 1));
	return { version, changed: version !== now };
}
