import { untrack } from 'svelte';
import { invalidate } from '$app/navigation';
import { showToast } from '$lib/components/ui/toast.svelte.js';

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

/**
 * Tell a member what the admin just did, so changes to their points never come
 * as a surprise: a reset of everyone's votes, or a villa taken off the list
 * (with how many of their points came back). Compares each refresh with the
 * previous one, so nothing shows on the first load. Call during component setup.
 *
 * @param {{
 *   resetAt: () => string | null,
 *   removed: () => string[],
 *   myBallot: () => import('$lib/voting.js').Ballot,
 *   budget: () => number,
 *   villaName: (id: string) => string
 * }} get
 */
export function useAdminNotices(get) {
	/** @type {{ resetAt: string | null, removed: string[], ballot: import('$lib/voting.js').Ballot } | null} */
	let prev = null;

	$effect(() => {
		const now = { resetAt: get.resetAt(), removed: get.removed(), ballot: get.myBallot() };
		untrack(() => {
			if (prev) {
				if (now.resetAt && now.resetAt !== prev.resetAt) {
					showToast(
						`The admin reset everyone's votes. You have all ${get.budget()} points again.`,
						'info',
						8000
					);
				}
				for (const id of now.removed) {
					if (prev.removed.includes(id)) continue;
					const back = prev.ballot[id] ?? 0;
					const returned = back ? ` Your ${back} point${back === 1 ? ' is' : 's are'} back.` : '';
					showToast(`${get.villaName(id)} was removed from the list.${returned}`, 'info', 8000);
				}
			}
			prev = now;
		});
	});
}
