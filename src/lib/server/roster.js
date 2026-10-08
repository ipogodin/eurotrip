import { readFileSync } from 'node:fs';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { parseMembers } from './members.js';
import { resolveSecret } from './session.js';

/** @type {import('./members.js').Member[] | undefined} */
let cache;

/**
 * The roster: `MEMBERS` env var (JSON). In dev only, falls back to the
 * gitignored `members.json` so nothing secret needs to be exported locally.
 * @returns {import('./members.js').Member[]}
 */
export function getMembers() {
	if (cache) return cache;
	let json = env.MEMBERS;
	if (!json && dev) {
		try {
			json = readFileSync('members.json', 'utf8');
		} catch {
			throw new Error(
				'No roster: set MEMBERS or create members.json (run `npm run members:init`).'
			);
		}
	}
	if (!json) throw new Error('MEMBERS env var is not set.');
	const { members, warnings } = parseMembers(JSON.parse(json));
	for (const w of warnings) console.warn(`[roster] ${w}`);
	cache = members;
	return members;
}

/**
 * @param {string} id
 * @returns {import('./members.js').Member | undefined}
 */
export function findMemberById(id) {
	return getMembers().find((m) => m.id === id);
}

/** @returns {string} */
export function getSessionSecret() {
	return resolveSecret(env.SESSION_SECRET, { production: !dev });
}
