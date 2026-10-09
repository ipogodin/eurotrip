import { error } from '@sveltejs/kit';
import { avatarCounts, avatarImage } from '$lib/server/avatars.js';
import { photoVersions } from '$lib/server/avatar-state.js';
import { requireMember } from '$lib/server/guards.js';
import { getMembers } from '$lib/server/roster.js';
import { getStore } from '$lib/server/store/index.js';

/**
 * One member's photo, for signed-in members only (the gate and `requireMember`).
 * A photo is only served up to the version that member is on now, so nobody can
 * spoil the "neh, this one is better" prank by guessing the next version's URL.
 */
export async function GET({ locals, params }) {
	requireMember(locals);
	const version = Number(params.version);
	if (!Number.isInteger(version) || version < 1) error(404, 'No such photo.');
	if (!getMembers().some((m) => m.id === params.id)) error(404, 'No such photo.');

	const store = getStore();
	const counts = await avatarCounts(store);
	const shown = (await photoVersions(store, [params.id], counts))[params.id];
	if (version > shown) error(404, 'No such photo.');

	const bytes = await avatarImage(store, params.id, version);
	if (!bytes) error(404, 'No such photo.');
	return new Response(new Uint8Array(bytes), {
		headers: {
			'Content-Type': 'image/webp',
			// Private: only the member's own browser may keep it; the version is in the URL.
			'Cache-Control': 'private, max-age=86400'
		}
	});
}
