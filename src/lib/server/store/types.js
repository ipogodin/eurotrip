/**
 * @typedef {Record<string, number>} Ballot  villaId -> points (1..MAX_PER_VILLA)
 *
 * @typedef {{
 *   winnerId: string | null;
 *   pickedAt: string | null;
 *   dateStart: string | null;
 *   dateEnd: string | null;
 *   checkIn: string | null;
 *   checkOut: string | null;
 *   notes: string | null;
 *   updatedAt: string | null;
 * }} TripState
 *
 * @typedef {{
 *   deadline: string | null,
 *   removed: string[],
 *   resetAt: string | null
 * }} VotingState  `removed` = villa ids the admin took off the list; `resetAt` = when the admin last reset everyone's votes
 *
 * @typedef {{
 *   getBallots(memberIds: string[]): Promise<Record<string, Ballot>>;
 *   setBallot(memberId: string, ballot: Ballot): Promise<void>;
 *   getVoting(): Promise<VotingState>;
 *   setVoting(patch: Partial<VotingState>): Promise<void>;
 *   getTrip(): Promise<TripState>;
 *   setTrip(patch: Partial<TripState>): Promise<void>;
 *   hit(key: string, ttlSec: number): Promise<number>;
 *   getValue(key: string): Promise<string | null>;
 *   setValue(key: string, value: string, ttlSec: number): Promise<void>;
 *   ttl(key: string): Promise<number>;
 *   del(key: string): Promise<void>;
 *   getAvatarVersions(): Promise<Record<string, number>>;
 *   setAvatarVersion(memberId: string, version: number): Promise<void>;
 *   getAvatarCounts(): Promise<Record<string, number>>;
 *   setAvatarCount(memberId: string, count: number): Promise<void>;
 *   getAvatarImage(memberId: string, version: number): Promise<string | null>;
 *   setAvatarImage(memberId: string, version: number, base64: string): Promise<void>;
 * }} Store
 */

export const TRIP_FIELDS = /** @type {const} */ ([
	'winnerId',
	'pickedAt',
	'dateStart',
	'dateEnd',
	'checkIn',
	'checkOut',
	'notes',
	'updatedAt'
]);

/**
 * Read a stored JSON list of ids; anything malformed counts as empty.
 * @param {string | null | undefined} raw
 * @returns {string[]}
 */
export function parseIds(raw) {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
	} catch {
		return [];
	}
}

/** @returns {TripState} */
export function emptyTrip() {
	return {
		winnerId: null,
		pickedAt: null,
		dateStart: null,
		dateEnd: null,
		checkIn: null,
		checkOut: null,
		notes: null,
		updatedAt: null
	};
}
