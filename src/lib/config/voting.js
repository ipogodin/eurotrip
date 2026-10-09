/** Default close time: Saturday 2026-10-10, 10:00 am Pacific (PDT, UTC-7). */
export const DEFAULT_DEADLINE = '2026-10-10T17:00:00Z';
/** How the default deadline is shown to people (always include the zone). */
export const DEADLINE_LABEL = 'Sat 10 Oct, 10:00 am PDT';

/** Points each person can spend in total. */
export const VOTE_BUDGET = 6;
/** Most points one person can give a single villa. */
export const MAX_PER_VILLA = 5;

/**
 * How the "Villas" view of /vote is drawn. One line to flip, then redeploy:
 *  - 'map'  photos of the villas on an illustrated Tenerife; tap one for its page
 *  - 'list' the original card grid (also tagged in git as `vote-list-v1`)
 * @type {'map' | 'list'}
 */
export const VOTE_LAYOUT = 'map';
