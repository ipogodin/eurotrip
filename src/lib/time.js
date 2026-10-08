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
