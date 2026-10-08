import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE_NAME = 'et_session';
export const SESSION_DAYS = 60;
const MIN_SECRET_LENGTH = 32;

/**
 * @typedef {{ memberId: string, iat: number, exp: number }} Session
 */

/**
 * Fail fast on a missing or weak secret in production.
 * @param {string | undefined} secret
 * @param {{ production: boolean }} opts
 * @returns {string}
 */
export function resolveSecret(secret, { production }) {
	if (secret && secret.length >= MIN_SECRET_LENGTH) return secret;
	if (production) {
		throw new Error(`SESSION_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters.`);
	}
	return 'dev-only-secret-not-for-production-use-0123456789';
}

/**
 * @param {string} payload
 * @param {string} secret
 */
const sign = (payload, secret) => createHmac('sha256', secret).update(payload).digest('base64url');

/**
 * Signed, tamper-evident session token: `base64url(json).base64url(hmac)`.
 * @param {string} memberId
 * @param {string} secret
 * @param {number} [now] ms epoch
 * @returns {string}
 */
export function createSession(memberId, secret, now = Date.now()) {
	const iat = Math.floor(now / 1000);
	const exp = iat + SESSION_DAYS * 86400;
	const payload = Buffer.from(JSON.stringify({ m: memberId, iat, exp })).toString('base64url');
	return `${payload}.${sign(payload, secret)}`;
}

/**
 * @param {string | undefined | null} token
 * @param {string} secret
 * @param {number} [now] ms epoch
 * @returns {Session | null}
 */
export function readSession(token, secret, now = Date.now()) {
	if (!token) return null;
	const parts = token.split('.');
	if (parts.length !== 2) return null;
	const [payload, sig] = parts;

	const expected = Buffer.from(sign(payload, secret));
	const given = Buffer.from(sig);
	if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

	try {
		const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
		if (typeof data?.m !== 'string' || !Number.isInteger(data.iat) || !Number.isInteger(data.exp)) {
			return null;
		}
		if (data.exp * 1000 <= now) return null;
		return { memberId: data.m, iat: data.iat, exp: data.exp };
	} catch {
		return null;
	}
}

/**
 * Options for `cookies.set` / `cookies.delete`.
 * @param {boolean} secure false only on plain-http local dev
 */
export function cookieOptions(secure) {
	return /** @type {const} */ ({
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		maxAge: SESSION_DAYS * 86400
	});
}
