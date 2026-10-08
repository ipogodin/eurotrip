import { error } from '@sveltejs/kit';
import { findVilla } from '$lib/config/villas.js';
import { requireMember } from '$lib/server/guards.js';
import { loadVoteData } from '$lib/server/vote-data.js';

export async function load({ locals, params, depends }) {
	depends('app:votes');
	const member = requireMember(locals);
	if (!findVilla(params.id)) error(404, 'That villa is not on the list.');
	// A removed villa still loads: the page explains instead of showing a bare error.
	return { villaId: params.id, ...(await loadVoteData(member)) };
}
