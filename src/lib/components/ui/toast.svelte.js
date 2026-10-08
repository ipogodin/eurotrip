/** @typedef {{ id: number, message: string, tone: 'success' | 'error' | 'info' }} ToastItem */

/** @type {{ items: ToastItem[] }} */
export const toasts = $state({ items: [] });

let nextId = 1;

/**
 * Show a short message at the bottom of the screen.
 * @param {string} message
 * @param {'success' | 'error' | 'info'} [tone]
 * @param {number} [ms]
 */
export function showToast(message, tone = 'info', ms = 2500) {
	const id = nextId++;
	toasts.items.push({ id, message, tone });
	setTimeout(() => {
		const i = toasts.items.findIndex((t) => t.id === id);
		if (i >= 0) toasts.items.splice(i, 1);
	}, ms);
}
