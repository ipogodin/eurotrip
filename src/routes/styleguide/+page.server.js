import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

/** Component gallery: development only. */
export function load() {
	if (!dev) error(404, 'Not found');
}
