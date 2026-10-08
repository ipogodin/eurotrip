import { showToast } from '$lib/components/ui/toast.svelte.js';

/**
 * Progressive-enhancement handler for the admin forms: run the action without
 * a page reload, tell the admin what happened in a toast, then refresh the
 * page data. `done` runs after any outcome (e.g. to close a confirm sheet).
 * @param {() => void} [done]
 * @returns {import('@sveltejs/kit').SubmitFunction}
 */
export function adminEnhance(done = () => {}) {
	return () =>
		async ({ result, update }) => {
			const message = /** @type {{ message?: string } | undefined} */ (
				'data' in result ? result.data : undefined
			)?.message;
			if (result.type === 'success') showToast(message ?? 'Done.', 'success', 4500);
			else if (result.type === 'failure') showToast(message ?? 'That did not work.', 'error', 6000);
			else if (result.type === 'error')
				showToast('Something went wrong. Try again.', 'error', 6000);
			done();
			await update({ reset: false });
		};
}
