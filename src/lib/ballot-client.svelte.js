import { deserialize } from '$app/forms';
import { invalidate } from '$app/navigation';
import { showToast } from '$lib/components/ui/toast.svelte.js';
import { withPoints } from '$lib/voting.js';

/** @typedef {import('$lib/voting.js').Ballot} Ballot */

const DEBOUNCE_MS = 600;

/**
 * Optimistic, debounced autosave of my ballot to the `/vote?/save` action.
 *
 * Every tap updates `draft` at once (the UI reads `ballot`), then the whole
 * ballot is sent 600 ms after the last tap. One request at a time; taps made
 * while a save is in flight are sent right after it. On rejection the draft
 * is dropped, so the UI falls back to the server's ballot, and a toast says
 * why.
 */
export class BallotClient {
	/** @type {Ballot | null} local edits the server hasn't confirmed yet */
	draft = $state(null);
	/** A save is scheduled (debouncing). */
	pending = $state(false);
	/** A save request is in flight. */
	saving = $state(false);

	/** @type {() => Ballot} */
	#server;
	#action;
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	#timer;
	#again = false;

	/**
	 * @param {() => Ballot} serverBallot  reads my ballot from the latest page data
	 * @param {string} [action]  form action URL
	 */
	constructor(serverBallot, action = '/vote?/save') {
		this.#server = serverBallot;
		this.#action = action;
	}

	/** What the UI should show: my unsaved edits, else the saved ballot. */
	get ballot() {
		return this.draft ?? this.#server();
	}

	/** Busy = polling must not overwrite what I'm doing. */
	get busy() {
		return this.pending || this.saving;
	}

	/**
	 * @param {string} villaId
	 * @param {number} points
	 */
	set(villaId, points) {
		this.draft = withPoints(this.ballot, villaId, points);
		this.pending = true;
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			this.pending = false;
			this.#flush();
		}, DEBOUNCE_MS);
	}

	/** Cancel a scheduled save (e.g. when leaving the page). */
	destroy() {
		clearTimeout(this.#timer);
	}

	async #flush() {
		if (this.saving) {
			this.#again = true;
			return;
		}
		const sent = this.draft;
		if (!sent) return;

		this.saving = true;
		try {
			const body = new FormData();
			body.set('ballot', JSON.stringify(sent));
			const res = await fetch(this.#action, {
				method: 'POST',
				body,
				headers: { 'x-sveltekit-action': 'true' }
			});
			// Session gone: the gate redirects to the login page.
			if (res.redirected) {
				location.href = res.url;
				return;
			}
			const result = deserialize(await res.text());
			if (result.type === 'success') {
				await invalidate('app:votes');
				// Keep newer taps made during the request; they're sent next.
				if (this.draft === sent) this.draft = null;
				showToast('Saved', 'success', 1400);
			} else {
				const message =
					result.type === 'failure' && typeof result.data?.message === 'string'
						? result.data.message
						: 'Could not save your votes. Try again.';
				this.#revert(message);
			}
		} catch {
			this.#revert('Could not save your votes. Check your connection.');
		} finally {
			this.saving = false;
			if (this.#again) {
				this.#again = false;
				this.#flush();
			}
		}
	}

	/** @param {string} message */
	async #revert(message) {
		clearTimeout(this.#timer);
		this.pending = false;
		this.#again = false;
		this.draft = null;
		showToast(message, 'error', 4500);
		await invalidate('app:votes');
	}
}
