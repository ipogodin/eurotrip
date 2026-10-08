import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import { matchPhrase } from '$lib/server/members.js';
import { safeNext } from '$lib/server/next.js';
import { checkLogin, recordFailure, recordSuccess } from '$lib/server/ratelimit.js';
import { getMembers, getSessionSecret } from '$lib/server/roster.js';
import { COOKIE_NAME, cookieOptions, createSession } from '$lib/server/session.js';
import { getStore } from '$lib/server/store/index.js';

/** Every login attempt takes at least this long, right or wrong. */
const MIN_RESPONSE_MS = 600;
const MAX_PHRASE_LENGTH = 100;
/** One message for wrong phrase, lockout and pause, so it reveals nothing. */
const MESSAGE = "That phrase didn't work.";

/** @param {number} startedAt */
async function holdUntilFloor(startedAt) {
	const wait = MIN_RESPONSE_MS - (Date.now() - startedAt);
	if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

export function load({ locals, url }) {
	if (locals.member) redirect(303, safeNext(url.searchParams.get('next')) ?? '/vote');
	return { next: safeNext(url.searchParams.get('next')) };
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const startedAt = Date.now();
		const form = await request.formData();
		const store = getStore();

		let ip = 'unknown';
		try {
			ip = getClientAddress();
		} catch {
			// keep the shared bucket: unknown clients share one limit
		}

		const gate = await checkLogin(store, ip);
		if (!gate.allowed) {
			await holdUntilFloor(startedAt);
			return fail(429, { message: MESSAGE, retryAfter: gate.retryAfter });
		}

		const honeypot = String(form.get('website') ?? '');
		const phrase = String(form.get('phrase') ?? '').slice(0, MAX_PHRASE_LENGTH);
		const member = honeypot ? null : matchPhrase(getMembers(), phrase);

		if (!member) {
			await recordFailure(store, ip);
			const after = await checkLogin(store, ip);
			await holdUntilFloor(startedAt);
			return fail(400, { message: MESSAGE, retryAfter: after.allowed ? 0 : after.retryAfter });
		}

		await recordSuccess(store, ip);
		cookies.set(COOKIE_NAME, createSession(member.id, getSessionSecret()), cookieOptions(!dev));
		await holdUntilFloor(startedAt);
		redirect(303, safeNext(form.get('next')) ?? '/vote');
	}
};
