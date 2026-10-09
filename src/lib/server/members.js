import { createHash, timingSafeEqual } from 'node:crypto';
import { isValidPhrase, normalizePhrase } from './phrase.js';

import { VOTE_BUDGET } from '../config/voting.js';

/**
 * `votes` is the member's point budget: the optional roster field, else the
 * default `VOTE_BUDGET`. `preferred` is what the app calls this person when it
 * talks TO them (greetings and so on): the optional roster field, else `short`.
 * It is PRIVATE to that member: never part of `PublicMember`, so it can't end up
 * on anyone else's screen; only `SelfMember` (the signed-in person) carries it.
 * @typedef {{ id: string, name: string, short: string, preferred: string, phrase: string, admin: boolean, votes: number }} Member
 * @typedef {{ id: string, name: string, short: string, isAdmin: boolean, votes: number, hue: number }} PublicMember
 * @typedef {PublicMember & { preferred: string }} SelfMember
 */

const ID_FORMAT = /^[a-z0-9][a-z0-9-]{1,23}$/;
export const EXPECTED_MEMBERS = 8;
/** Longest preferred name; keeps a greeting from breaking a layout. */
export const MAX_PREFERRED = 30;
/** Sanity cap for a custom per-member budget. */
export const MAX_CUSTOM_VOTES = 30;

/**
 * Validate and normalize the raw roster (the parsed `MEMBERS` JSON).
 * Throws one Error listing every problem, so a bad roster fails the deploy
 * loudly instead of silently locking people out.
 * @param {unknown} raw
 * @returns {{ members: Member[], warnings: string[] }}
 */
export function parseMembers(raw) {
	/** @type {string[]} */
	const errors = [];
	/** @type {string[]} */
	const warnings = [];
	if (!Array.isArray(raw) || raw.length === 0) {
		throw new Error('Roster must be a non-empty JSON array of members.');
	}

	/** @type {Member[]} */
	const members = [];
	const ids = new Set();
	const phrases = new Set();
	let withoutPreferred = 0;

	raw.forEach((entry, i) => {
		const at = `member #${i + 1}`;
		if (!entry || typeof entry !== 'object') {
			errors.push(`${at}: must be an object`);
			return;
		}
		const e = /** @type {Record<string, unknown>} */ (entry);
		const id = typeof e.id === 'string' ? e.id.trim().toLowerCase() : '';
		const name = typeof e.name === 'string' ? e.name.trim() : '';
		if (!ID_FORMAT.test(id)) errors.push(`${at}: id must be 2-24 chars of a-z, 0-9 or "-"`);
		else if (ids.has(id)) errors.push(`${at}: duplicate id "${id}"`);
		ids.add(id);
		if (!name) errors.push(`${at} (${id || '?'}): name is required`);
		const short =
			typeof e.short === 'string' && e.short.trim() ? e.short.trim() : name.split(/\s+/)[0] || id;

		const phrase = normalizePhrase(e.phrase);
		if (!isValidPhrase(phrase)) {
			errors.push(`${at} (${id || '?'}): phrase must be two words joined by a dash`);
		} else if (phrases.has(phrase)) {
			errors.push(`${at} (${id || '?'}): phrase is already used by another member`);
		}
		phrases.add(phrase);

		let votes = VOTE_BUDGET;
		if (e.votes !== undefined) {
			if (
				typeof e.votes !== 'number' ||
				!Number.isInteger(e.votes) ||
				e.votes < 1 ||
				e.votes > MAX_CUSTOM_VOTES
			) {
				errors.push(
					`${at} (${id || '?'}): votes must be a whole number from 1 to ${MAX_CUSTOM_VOTES}`
				);
			} else votes = e.votes;
		}

		// Blank (or null) = "not filled in yet": the app uses the short name instead.
		let preferred = short;
		const given = e.preferred;
		if (given === undefined || given === null || (typeof given === 'string' && !given.trim())) {
			withoutPreferred++;
		} else if (
			typeof given !== 'string' ||
			given.trim().length > MAX_PREFERRED ||
			// eslint-disable-next-line no-control-regex -- reject newlines and other control characters
			/[\u0000-\u001f\u007f]/.test(given.trim())
		) {
			errors.push(
				`${at} (${id || '?'}): preferred must be 1-${MAX_PREFERRED} characters on one line (or left blank)`
			);
		} else preferred = given.trim();

		members.push({ id, name, short, preferred, phrase, admin: e.admin === true, votes });
	});

	if (!members.some((m) => m.admin)) errors.push('at least one member must have "admin": true');
	if (errors.length) throw new Error(`Invalid roster:\n- ${errors.join('\n- ')}`);
	if (members.length !== EXPECTED_MEMBERS) {
		warnings.push(`Roster has ${members.length} members (expected ${EXPECTED_MEMBERS}).`);
	}
	if (withoutPreferred > 0) {
		warnings.push(
			`${withoutPreferred} member${withoutPreferred === 1 ? ' has' : 's have'} no "preferred" name; the app will use their short name.`
		);
	}
	return { members, warnings };
}

/** @param {string} s */
const sha256 = (s) => createHash('sha256').update(s).digest();

/**
 * Find the member whose phrase matches the input. Compares against every
 * member in constant time (no early exit), so timing reveals nothing.
 * @param {Member[]} members
 * @param {unknown} input
 * @returns {Member | null}
 */
export function matchPhrase(members, input) {
	const given = sha256(normalizePhrase(input));
	/** @type {Member | null} */
	let found = null;
	for (const m of members) {
		const same = timingSafeEqual(given, sha256(m.phrase));
		if (same && !found) found = m;
	}
	return found;
}

/**
 * The only member shape that may leave the server (never the phrase).
 * `hue` is the avatar colour slot (see `hueForIndex`), from the roster position.
 * @param {Member} m
 * @param {number} hue
 * @returns {PublicMember}
 */
export function toPublic(m, hue) {
	return { id: m.id, name: m.name, short: m.short, isAdmin: m.admin, votes: m.votes, hue };
}

/**
 * The signed-in member as THEY see themselves: everything public plus their own
 * preferred name. Only ever used for `locals.member` (the current visitor), never
 * for the roster shown to others.
 * @param {Member} m
 * @param {number} hue
 * @returns {SelfMember}
 */
export function toSelf(m, hue) {
	return { ...toPublic(m, hue), preferred: m.preferred };
}
