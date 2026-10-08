import { fail } from '@sveltejs/kit';
import { villas } from '$lib/config/villas.js';
import { pacificToUtc, utcToPacificInput } from '$lib/time.js';
import { pruneBallot, tally } from '$lib/voting.js';
import {
	closeNow,
	currentStatus,
	pickWinner,
	removeVilla,
	resetAllVotes,
	restoreVilla,
	setDeadline,
	undoWinner
} from '$lib/server/admin-actions.js';
import { requireAdmin } from '$lib/server/guards.js';
import { getLoginStats } from '$lib/server/ratelimit.js';
import { getMembers } from '$lib/server/roster.js';
import { getStore } from '$lib/server/store/index.js';
import { activeVillaIds } from '$lib/server/vote-data.js';

const allVillaIds = villas.map((v) => v.id);

/** Turn an action outcome into what SvelteKit returns to the form. */
function respond(/** @type {{ ok: boolean, message?: string, error?: string }} */ outcome) {
	return outcome.ok ? { message: outcome.message } : fail(400, { message: outcome.error });
}

/** @param {FormData} form @param {string} name */
const text = (form, name) => {
	const v = form.get(name);
	return typeof v === 'string' ? v : '';
};

export async function load({ locals }) {
	requireAdmin(locals);
	const store = getStore();
	const members = getMembers().map(({ id, name, short, votes }) => ({ id, name, short, votes }));
	const [status, rawBallots, stats] = await Promise.all([
		currentStatus(store, Date.now()),
		store.getBallots(members.map((m) => m.id)),
		getLoginStats(store)
	]);
	const keep = activeVillaIds(status.removed);
	const ballots = Object.fromEntries(
		Object.entries(rawBallots).map(([id, b]) => [id, pruneBallot(b, keep)])
	);
	const results = tally(
		ballots,
		villas.filter((v) => keep.includes(v.id)),
		members
	);
	return {
		members,
		...status,
		/** The deadline as Pacific wall-clock time, for the date box. */
		deadlineInput: utcToPacificInput(status.deadline),
		results,
		stats
	};
}

// Every action starts with requireAdmin: hiding a button is not security.
export const actions = {
	extend: async ({ locals, request }) => {
		requireAdmin(locals);
		const iso = pacificToUtc(text(await request.formData(), 'deadline'));
		if (!iso) return fail(400, { message: 'Enter a date and time.' });
		return respond(await setDeadline(getStore(), iso, Date.now()));
	},
	closeNow: async ({ locals }) => {
		requireAdmin(locals);
		return respond(await closeNow(getStore(), Date.now()));
	},
	pickWinner: async ({ locals, request }) => {
		requireAdmin(locals);
		const villaId = text(await request.formData(), 'villaId');
		const store = getStore();
		const { removed } = await currentStatus(store, Date.now());
		return respond(await pickWinner(store, villaId, activeVillaIds(removed), Date.now()));
	},
	undoWinner: async ({ locals }) => {
		requireAdmin(locals);
		return respond(await undoWinner(getStore(), Date.now()));
	},
	resetAll: async ({ locals }) => {
		requireAdmin(locals);
		return respond(
			await resetAllVotes(
				getStore(),
				getMembers().map((m) => m.id),
				Date.now()
			)
		);
	},
	removeVilla: async ({ locals, request }) => {
		requireAdmin(locals);
		const villaId = text(await request.formData(), 'villaId');
		return respond(
			await removeVilla(getStore(), {
				villaId,
				allVillaIds,
				memberIds: getMembers().map((m) => m.id),
				now: Date.now()
			})
		);
	},
	restoreVilla: async ({ locals, request }) => {
		requireAdmin(locals);
		return respond(await restoreVilla(getStore(), text(await request.formData(), 'villaId')));
	}
};
