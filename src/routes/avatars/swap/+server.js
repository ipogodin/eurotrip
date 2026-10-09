import { error, json } from '@sveltejs/kit';
import { swapPhoto } from '$lib/server/avatar-state.js';
import { avatarCounts } from '$lib/server/avatars.js';
import { requireMember } from '$lib/server/guards.js';
import { getStore } from '$lib/server/store/index.js';

/**
 * The member pressed "update photo". Whatever photo they picked stays on their
 * own device: this request carries no picture. They're moved to the next
 * prepared version and given a random phrase.
 */
export async function POST({ locals, request }) {
	const member = requireMember(locals);
	// Only a real form post: SvelteKit's cross-site (CSRF) check covers these types.
	const type = request.headers.get('content-type') ?? '';
	if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)/.test(type)) {
		error(415, 'Send this as a form.');
	}
	const store = getStore();
	const result = await swapPhoto(store, member.id, await avatarCounts(store));
	if (!result.ok) error(400, result.error);
	return json({ version: result.version, changed: result.changed, phrase: result.phrase });
}
