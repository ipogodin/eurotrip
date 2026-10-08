import { invalidate } from '$app/navigation';

const POLL_MS = 15_000;

/**
 * Keep everyone else's votes fresh: refresh every 15 s and when the tab comes
 * back, but never while my own save is pending (it would flash old data).
 * Also refresh right when the deadline passes so the screen locks on time.
 * Call during component setup.
 *
 * @param {{ busy: () => boolean, deadline: () => string, open: () => boolean }} get
 */
export function useVotePolling(get) {
	$effect(() => {
		const refresh = () => {
			if (document.visibilityState === 'visible' && !get.busy()) invalidate('app:votes');
		};
		const id = setInterval(refresh, POLL_MS);
		document.addEventListener('visibilitychange', refresh);
		return () => {
			clearInterval(id);
			document.removeEventListener('visibilitychange', refresh);
		};
	});

	$effect(() => {
		if (!get.open()) return;
		const ms = Date.parse(get.deadline()) - Date.now();
		if (ms > 2 ** 31 - 1) return; // beyond setTimeout's range; polling covers it
		const id = setTimeout(() => invalidate('app:votes'), Math.max(0, ms) + 1000);
		return () => clearTimeout(id);
	});
}
