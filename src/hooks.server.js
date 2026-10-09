import { dev } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { toPublic } from '$lib/server/members.js';
import { findMemberById, getSessionSecret, hueFor } from '$lib/server/roster.js';
import { COOKIE_NAME, readSession } from '$lib/server/session.js';

/** Paths an anonymous visitor may reach: only the login splash. */
const PUBLIC_PATHS = new Set(['/']);

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.member = null;

	const token = event.cookies.get(COOKIE_NAME);
	if (token) {
		const session = readSession(token, getSessionSecret());
		const member = session ? findMemberById(session.memberId) : undefined;
		if (member) event.locals.member = toPublic(member, hueFor(member.id));
		else event.cookies.delete(COOKIE_NAME, { path: '/' }); // forged, expired or removed member
	}

	const { pathname, search } = event.url;
	// The dev-only component gallery doesn't need a login on localhost.
	const open = PUBLIC_PATHS.has(pathname) || (dev && pathname.startsWith('/styleguide'));
	if (!event.locals.member && !open) {
		const safe = event.request.method === 'GET' || event.request.method === 'HEAD';
		redirect(303, safe ? `/?next=${encodeURIComponent(pathname + search)}` : '/');
	}

	const response = await resolve(event);
	// Dev allows same-origin framing so responsive previews work; production never frames.
	response.headers.set('X-Frame-Options', dev ? 'SAMEORIGIN' : 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	// Pages differ per member and must never sit in a shared cache.
	if (!response.headers.has('cache-control')) {
		response.headers.set('Cache-Control', 'private, no-store');
	}
	return response;
}
