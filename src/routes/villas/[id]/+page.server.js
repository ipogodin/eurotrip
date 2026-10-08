import { error } from '@sveltejs/kit';
import { findVilla } from '$lib/config/villas.js';
import { loadVoteData } from '$lib/server/vote-data.js';

export async function load({ locals, params, depends }) {
	depends('app:votes');
	if (!locals.member) error(401, 'Sign in first.');
	if (!findVilla(params.id)) error(404, 'That villa is not on the list.');
	return { villaId: params.id, ...(await loadVoteData(locals.member)) };
}
