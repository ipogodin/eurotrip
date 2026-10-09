import { photoVersions } from '$lib/server/avatar-state.js';
import { avatarCounts } from '$lib/server/avatars.js';
import { getStore } from '$lib/server/store/index.js';

/**
 * Every page gets the signed-in member (or null) for the app bar, including the
 * photo they currently show. Re-runs with the vote refresh, so a photo change is
 * picked up everywhere within ~15 seconds.
 */
export async function load({ locals, depends }) {
	depends('app:votes');
	const member = locals.member;
	if (!member) return { member: null };
	const store = getStore();
	const photos = await photoVersions(store, [member.id], await avatarCounts(store));
	return { member: { ...member, photo: photos[member.id] || undefined } };
}
