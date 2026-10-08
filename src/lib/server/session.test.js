import { describe, expect, it } from 'vitest';
import {
	cookieOptions,
	createSession,
	readSession,
	resolveSecret,
	SESSION_DAYS
} from './session.js';

const SECRET = 'a'.repeat(40);
const NOW = Date.parse('2026-10-09T12:00:00Z');

describe('session tokens', () => {
	it('round-trips a member id with an expiry 60 days out', () => {
		const token = createSession('illia', SECRET, NOW);
		const s = readSession(token, SECRET, NOW + 1000);
		expect(s).not.toBeNull();
		expect(s?.memberId).toBe('illia');
		expect((s?.exp ?? 0) - (s?.iat ?? 0)).toBe(SESSION_DAYS * 86400);
	});

	it('rejects a different secret', () => {
		const token = createSession('illia', SECRET, NOW);
		expect(readSession(token, 'b'.repeat(40), NOW)).toBeNull();
	});

	it('rejects a tampered payload (member swapped, old signature kept)', () => {
		const token = createSession('anna', SECRET, NOW);
		const [, sig] = token.split('.');
		const forged = Buffer.from(JSON.stringify({ m: 'illia', iat: 1, exp: 9_999_999_999 })).toString(
			'base64url'
		);
		expect(readSession(`${forged}.${sig}`, SECRET, NOW)).toBeNull();
	});

	it('rejects a tampered signature', () => {
		const token = createSession('illia', SECRET, NOW);
		expect(readSession(`${token.slice(0, -2)}xx`, SECRET, NOW)).toBeNull();
	});

	it('rejects expired sessions', () => {
		const token = createSession('illia', SECRET, NOW);
		const after = NOW + (SESSION_DAYS * 86400 + 1) * 1000;
		expect(readSession(token, SECRET, after)).toBeNull();
	});

	it('rejects garbage', () => {
		for (const t of [undefined, null, '', 'abc', 'a.b.c', '.', 'x.y']) {
			expect(readSession(t, SECRET, NOW)).toBeNull();
		}
	});
});

describe('resolveSecret', () => {
	it('returns a good secret as is', () => {
		expect(resolveSecret(SECRET, { production: true })).toBe(SECRET);
	});
	it('throws in production when missing or short', () => {
		expect(() => resolveSecret(undefined, { production: true })).toThrow(/SESSION_SECRET/);
		expect(() => resolveSecret('short', { production: true })).toThrow(/SESSION_SECRET/);
	});
	it('uses a dev fallback outside production', () => {
		expect(resolveSecret(undefined, { production: false }).length).toBeGreaterThanOrEqual(32);
	});
});

describe('cookieOptions', () => {
	it('is httpOnly, lax, root-scoped and lasts 60 days', () => {
		expect(cookieOptions(true)).toEqual({
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 60 * 86400
		});
		expect(cookieOptions(false).secure).toBe(false);
	});
});
