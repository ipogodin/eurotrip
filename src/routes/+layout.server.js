/** Every page gets the signed-in member (or null) for the app bar. */
export function load({ locals }) {
	return { member: locals.member };
}
