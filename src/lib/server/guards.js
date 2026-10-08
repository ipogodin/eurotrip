import { error } from '@sveltejs/kit';

/**
 * Every member-only load and action starts here. The login gate in hooks
 * already redirects anonymous visitors; this is the second lock, so a route
 * stays safe even if the gate changes.
 * @param {App.Locals} locals
 * @returns {NonNullable<App.Locals['member']>}
 */
export function requireMember(locals) {
	if (!locals.member) error(401, 'Sign in first.');
	return locals.member;
}

/**
 * Admin-only loads and EVERY admin action call this (not just the page):
 * hiding a button is not security. Non-admins get 403.
 * @param {App.Locals} locals
 * @returns {NonNullable<App.Locals['member']>}
 */
export function requireAdmin(locals) {
	const member = requireMember(locals);
	if (!member.isAdmin) error(403, 'Admins only.');
	return member;
}
