// Declaration file only: types for `event.locals`, no runtime code.
declare global {
	namespace App {
		interface Locals {
			/** The signed-in member, or null for anonymous visitors. */
			member: import('$lib/server/members.js').SelfMember | null;
		}
	}
}

export {};
