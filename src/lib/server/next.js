/**
 * Only same-site relative paths may be used as a post-login redirect, so a
 * crafted `?next=` can never bounce someone to another site.
 * @param {unknown} value
 * @returns {string | null}
 */
export function safeNext(value) {
	if (typeof value !== 'string') return null;
	if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
	// Control characters and anything that isn't a plain path/query.
	// eslint-disable-next-line no-control-regex
	if (/[\u0000-\u001f\u007f]/.test(value)) return null;
	if (value === '/') return null;
	return value;
}
