/**
 * @typedef {Record<string, 1 | 2 | 3>} Ballot  villaId -> points
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
 * @typedef {{ deadline: string | null }} VotingState
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
