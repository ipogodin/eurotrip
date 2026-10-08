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

const LA = 'America/Los_Angeles';

/**
 * How far Los Angeles clocks are from UTC at an instant, in ms (negative:
 * behind UTC; PDT = -7 h, PST = -8 h).
 * @param {number} utcMs
 */
function laOffsetMs(utcMs) {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: LA,
		hourCycle: 'h23',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).formatToParts(new Date(utcMs));
	/** @param {string} type */
	const n = (type) => Number(parts.find((p) => p.type === type)?.value);
	const asIfUtc = Date.UTC(
		n('year'),
		n('month') - 1,
		n('day'),
		n('hour'),
		n('minute'),
		n('second')
	);
	return asIfUtc - Math.floor(utcMs / 1000) * 1000;
}

/**
 * Turn a wall-clock time typed in Pacific time (`<input type="datetime-local">`,
 * "2026-10-11T09:30") into a UTC ISO string, honouring daylight saving.
 * Returns null for anything that isn't a valid date and time. A time that
 * doesn't exist (spring-forward gap) or happens twice (fall-back hour) still
 * maps to one real instant.
 * @param {unknown} local
 * @returns {string | null}
 */
export function pacificToUtc(local) {
	const m = typeof local === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
	if (!m) return null;
	const [y, mo, d, h, mi] = m.slice(1).map(Number);
	const asIfUtc = Date.UTC(y, mo - 1, d, h, mi);
	const check = new Date(asIfUtc);
	// Reject rollovers like Feb 30 or 25:00.
	if (
		check.getUTCFullYear() !== y ||
		check.getUTCMonth() !== mo - 1 ||
		check.getUTCDate() !== d ||
		check.getUTCHours() !== h ||
		check.getUTCMinutes() !== mi
	) {
		return null;
	}
	const first = asIfUtc - laOffsetMs(asIfUtc);
	const second = asIfUtc - laOffsetMs(first);
	return new Date(second).toISOString();
}

/**
 * The reverse, to prefill `datetime-local`: a UTC ISO string as Pacific
 * wall-clock "YYYY-MM-DDTHH:mm".
 * @param {string} iso
 */
export function utcToPacificInput(iso) {
	const t = Date.parse(iso);
	return new Date(t + laOffsetMs(t)).toISOString().slice(0, 16);
}
