import { redirect } from '@sveltejs/kit';
import { COOKIE_NAME } from '$lib/server/session.js';

/** Log out (POST from the account menu). */
export function POST({ cookies }) {
	cookies.delete(COOKIE_NAME, { path: '/' });
	redirect(303, '/');
}

/** A stray GET (typed URL, prefetch) just goes home without logging anyone out. */
export function GET() {
	redirect(303, '/');
}
