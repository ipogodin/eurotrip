/**
 * Shapes shared by the vote components (JSDoc only, no runtime code).
 *
 * @typedef {import('$lib/members-ui.js').PublicMember} Member
 * @typedef {import('$lib/config/villas.js').Villa} Villa
 *
 * @typedef {{
 *   villa: Villa,
 *   rank: number | null,
 *   total: number,
 *   voters: { member: Member, points: number }[],
 *   myPoints: number,
 *   canAdd: boolean,
 *   addHint: string,
 *   comments: number
 * }} VillaRow
 *
 * @typedef {{
 *   member: Member,
 *   spent: number,
 *   left: number,
 *   picks: { villa: Villa, points: number }[]
 * }} PersonRowData
 */

export {};
