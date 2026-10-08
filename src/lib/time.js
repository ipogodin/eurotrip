/**
 * Human countdown text for the time between `now` and `deadline` (ms epoch).
 * @param {number} now
 * @param {number} deadline
 * @returns {{ text: string, closed: boolean, urgent: boolean, final: boolean }}
 */
export function formatRemaining(now, deadline) {
	const ms = deadline - now;
	if (ms <= 0) return { text: 'Voting closed', closed: true, urgent: false, final: false };
	const totalSec = Math.floor(ms / 1000);
	const d = Math.floor(totalSec / 86400);
	const h = Math.floor((totalSec % 86400) / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
	const final = totalSec < 300;
	/** @type {string} */
	let text;
	if (final) text = `${pad(m)}:${pad(s)}`;
	else if (d > 0) text = `${d}d ${h}h`;
	else text = `${h}h ${pad(m)}m`;
	return { text, closed: false, urgent: ms < 86_400_000, final };
}

/**
 * The voting deadline in the organisers' zone, e.g. "Sat, Oct 10, 9:30 AM PDT".
 * Always Pacific time with the zone name, so nobody misreads it.
 * @param {string} iso
 */
export function formatDeadline(iso) {
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'America/Los_Angeles',
		timeZoneName: 'short'
	}).format(new Date(iso));
}

/**
 * "Feb 13 – 22" or "Feb 20 – Mar 1" for two calendar dates (YYYY-MM-DD).
 * @param {{ start: string, end: string }} range
 */
export function formatDateRange({ start, end }) {
	const day = (/** @type {string} */ d) => new Date(`${d}T00:00:00Z`);
	const md = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
	const a = day(start);
	const b = day(end);
	const sameMonth = a.getUTCMonth() === b.getUTCMonth();
	return `${md.format(a)} – ${sameMonth ? b.getUTCDate() : md.format(b)}`;
}

/**
 * Whole-unit money, e.g. "$6,719".
 * @param {number} amount
 * @param {string} currency
 */
export function formatMoney(amount, currency) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0
	}).format(amount);
}
