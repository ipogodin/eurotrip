import { describe, expect, it } from 'vitest';
import { requireAdmin, requireMember } from './guards.js';

/** @param {Partial<NonNullable<App.Locals['member']>> | null} m */
const locals = (m) =>
	/** @type {App.Locals} */ ({
		member: m && { id: 'x', name: 'X', short: 'X', isAdmin: false, votes: 6, ...m }
	});

/** @param {() => unknown} fn */
function statusOf(fn) {
	try {
		fn();
	} catch (e) {
		return /** @type {{ status?: number }} */ (e).status;
	}
	return 200;
}

describe('guards', () => {
	it('lets any signed-in member through requireMember', () => {
		expect(statusOf(() => requireMember(locals({})))).toBe(200);
	});
	it('turns anonymous visitors away with 401', () => {
		expect(statusOf(() => requireMember(locals(null)))).toBe(401);
		expect(statusOf(() => requireAdmin(locals(null)))).toBe(401);
	});
	it('gives non-admins 403 and admins through', () => {
		expect(statusOf(() => requireAdmin(locals({ isAdmin: false })))).toBe(403);
		expect(statusOf(() => requireAdmin(locals({ isAdmin: true })))).toBe(200);
	});
	it('returns the member', () => {
		expect(requireAdmin(locals({ id: 'illia', isAdmin: true })).id).toBe('illia');
	});
});
