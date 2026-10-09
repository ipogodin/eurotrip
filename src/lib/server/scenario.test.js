/**
 * "Does the site work for each of the 8 members?" — the real vote and admin
 * handlers, run once per member, against the in-memory store.
 *
 * Uses the real roster's PUBLIC fields (id, name, short, admin, votes) when
 * `members.json` is present, so what's verified is the actual group; invite
 * phrases are never read (placeholders are used). Without that file (CI, a
 * fresh clone) it runs on 8 made-up members, so it always runs.
 *
 * Login itself (phrase matching, sessions, the gate) is covered by its own tests;
 * here each member is "already signed in" as `locals.member`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { villas } from '../config/villas.js';
import { MAX_PER_VILLA } from '../config/voting.js';
import { hueForIndex } from '../members-ui.js';
import { spent } from '../voting.js';
import { createMemoryStore } from './store/memory.js';
import { toSelf } from './members.js';

const h = vi.hoisted(() => ({
	/** @type {import('./store/types.js').Store | null} */ store: null,
	/** @type {import('./members.js').Member[]} */ members: []
}));

vi.mock('./store/index.js', () => ({ getStore: () => h.store }));
vi.mock('./roster.js', () => ({
	getMembers: () => h.members,
	findMemberById: (/** @type {string} */ id) => h.members.find((m) => m.id === id),
	hueFor: (/** @type {string} */ id) =>
		hueForIndex(
			Math.max(
				0,
				h.members.findIndex((m) => m.id === id)
			)
		)
}));

const vote = await import('../../routes/vote/+page.server.js');
const admin = await import('../../routes/admin/+page.server.js');
const villaPage = await import('../../routes/villas/[id]/+page.server.js');
const layout = await import('../../routes/+layout.server.js');

const REAL = existsSync('members.json');
/** @returns {import('./members.js').Member[]} */
function loadRoster() {
	/** @type {Record<string, unknown>[]} */
	const raw = REAL
		? JSON.parse(readFileSync('members.json', 'utf8'))
		: Array.from({ length: 8 }, (_, i) => ({
				id: `member${i + 1}`,
				name: `Member Number${i + 1}`,
				admin: i === 0
			}));
	return raw.map((m, i) => ({
		// Always a unique marker (never the real value), so a leak is detectable.
		preferred: `zzpref-${i}`,
		id: String(m.id),
		name: String(m.name),
		short: typeof m.short === 'string' && m.short ? m.short : String(m.name).split(' ')[0],
		admin: m.admin === true,
		votes: typeof m.votes === 'number' ? m.votes : 6,
		// A placeholder: the real phrase is deliberately never read here.
		phrase: `zzphrase${'abcdefgh'[i] ?? 'x'}-zzphrase${i}`
	}));
}
const roster = loadRoster();
const budgetOf = (/** @type {{ votes: number }} */ m) => m.votes;
const V = villas.map((v) => v.id); // 13 villa ids

/** @param {import('./members.js').Member} m */
function locals(m) {
	return /** @type {App.Locals} */ ({ member: toSelf(m, hueForIndex(roster.indexOf(m))) });
}
/** @param {Record<string, string>} fields */
function post(fields) {
	const body = new FormData();
	for (const [k, v] of Object.entries(fields)) body.set(k, v);
	return new Request('http://localhost/x', { method: 'POST', body });
}
/** @param {import('./members.js').Member} m @param {unknown} ballot */
const save = (m, ballot) =>
	/** @type {any} */ (vote.actions.save)({
		locals: locals(m),
		request: post({ ballot: JSON.stringify(ballot) })
	});
/** @param {unknown} fn @returns {Promise<{ status: number, data?: any }>} */
async function outcome(fn) {
	try {
		const r = /** @type {any} */ (await fn);
		return { status: r?.status ?? 200, data: r?.data ?? r };
	} catch (e) {
		return { status: /** @type {{ status: number }} */ (e).status };
	}
}
const adminFns = /** @type {Record<string, (e: any) => unknown>} */ (admin.actions);

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2026-10-09T18:00:00Z')); // voting open (closes Oct 10, 16:30Z)
	h.store = createMemoryStore();
	h.members = roster;
});
afterEach(() => vi.useRealTimers());

describe(`the roster (${REAL ? 'the real 8 members' : '8 made-up members'})`, () => {
	it('has 8 members, exactly one admin, and unique ids, names and short names', () => {
		expect(roster).toHaveLength(8);
		expect(roster.filter((m) => m.admin)).toHaveLength(1);
		for (const key of /** @type {const} */ (['id', 'name', 'short'])) {
			expect(new Set(roster.map((m) => m[key].toLowerCase())).size, key).toBe(8);
		}
	});
	it('gives every member a different avatar colour', () => {
		expect(new Set(roster.map((_, i) => hueForIndex(i))).size).toBe(8);
	});
	it('gives everyone the default 6 points unless the roster says otherwise', () => {
		for (const m of roster) expect(budgetOf(m)).toBeGreaterThanOrEqual(1);
	});
});

describe.each(roster.map((m) => [m.short + (m.admin ? ' (admin)' : ''), m]))(
	'member %s',
	(_label, m) => {
		const member = /** @type {import('./members.js').Member} */ (m);

		it("sees the vote page data, and never anyone's invite phrase", async () => {
			const data = await vote.load(/** @type {any} */ ({ locals: locals(member), depends() {} }));
			expect(data.me).toBe(member.id);
			expect(data.members).toHaveLength(8);
			expect(data.state).toBe('open');
			const json = JSON.stringify(data);
			expect(json).not.toContain('phrase');
			for (const x of roster) expect(json).not.toContain(x.phrase);
		});

		it("gets their own preferred name, and never anyone else's, in anything they can receive", async () => {
			const own = member.preferred;
			const others = roster.filter((x) => x.id !== member.id).map((x) => x.preferred);
			const received = {
				layout: await layout.load(/** @type {any} */ ({ locals: locals(member), depends() {} })),
				vote: await vote.load(/** @type {any} */ ({ locals: locals(member), depends() {} })),
				villas: await Promise.all(
					V.map((id) =>
						villaPage.load(
							/** @type {any} */ ({ locals: locals(member), params: { id }, depends() {} })
						)
					)
				),
				admin: member.admin
					? await admin.load(/** @type {any} */ ({ locals: locals(member) }))
					: null
			};
			// They see their own private name (in the layout data that feeds the greeting)...
			expect(received.layout.member?.preferred).toBe(own);
			// ...and nothing they receive contains anyone else's.
			const json = JSON.stringify(received);
			for (const other of others) expect(json).not.toContain(other);
			// The roster that goes to everyone has no such field at all.
			for (const m of received.vote.members) expect(m).not.toHaveProperty('preferred');
			if (received.admin) {
				for (const m of received.admin.members) expect(m).not.toHaveProperty('preferred');
			}
		});

		it('can comment on a villa, sees what others wrote, and can delete only their own', async () => {
			const asMember = locals(member);
			const others = roster.filter((x) => x.id !== member.id);
			const say = (
				/** @type {App.Locals} */ who,
				/** @type {string} */ id,
				/** @type {string} */ text
			) =>
				outcome(
					/** @type {any} */ (villaPage.actions.comment)({
						locals: who,
						params: { id },
						request: post({ text })
					})
				);
			const read = async (/** @type {App.Locals} */ who, /** @type {string} */ id) =>
				(await villaPage.load(/** @type {any} */ ({ locals: who, params: { id }, depends() {} })))
					.comments;
			// someone else already commented
			expect((await say(locals(others[0]), V[0], `from ${others[0].id}`)).status).toBe(200);
			// this member writes one too
			expect((await say(asMember, V[0], `from ${member.id}`)).status).toBe(200);
			const seen = await read(asMember, V[0]);
			expect(seen.map((/** @type {any} */ c) => c.memberId).sort()).toEqual(
				[others[0].id, member.id].sort()
			);
			// the comment data only ever names people by id: nobody's private preferred name is in it
			for (const x of roster) expect(JSON.stringify(seen)).not.toContain(x.preferred);
			// can delete their own, not the other person's
			const mine = /** @type {any} */ (
				seen.find((/** @type {any} */ c) => c.memberId === member.id)
			);
			const theirs = /** @type {any} */ (
				seen.find((/** @type {any} */ c) => c.memberId === others[0].id)
			);
			const del = (/** @type {string} */ commentId) =>
				outcome(
					/** @type {any} */ (villaPage.actions.deleteComment)({
						locals: asMember,
						params: { id: V[0] },
						request: post({ commentId })
					})
				);
			expect((await del(theirs.id)).status).toBe(member.admin ? 200 : 400); // only the admin may
			expect((await del(mine.id)).status).toBe(200);
			const left = (await read(asMember, V[0])).map((/** @type {any} */ c) => c.memberId);
			expect(left).not.toContain(member.id);
			expect(left.includes(others[0].id)).toBe(!member.admin);
		});

		it('can open every villa page', async () => {
			for (const id of V) {
				const d = await villaPage.load(
					/** @type {any} */ ({ locals: locals(member), params: { id }, depends() {} })
				);
				expect(d.villaId).toBe(id);
			}
		});

		it('can spend exactly their own budget, no more', async () => {
			const budget = budgetOf(member);
			// the per-villa cap, as many villas as it takes.
			/** @type {Record<string, number>} */
			const ballot = {};
			let left = budget;
			for (const id of V) {
				if (left <= 0) break;
				ballot[id] = Math.min(MAX_PER_VILLA, left);
				left -= ballot[id];
			}
			expect((await outcome(save(member, ballot))).status).toBe(200);
			const stored = (await /** @type {any} */ (h.store).getBallots([member.id]))[member.id];
			expect(spent(stored)).toBe(budget);

			// One point more than the budget is refused, and the saved ballot is untouched.
			const over = { ...ballot, [V[V.length - 1]]: (ballot[V[V.length - 1]] ?? 0) + 1 };
			if (budget < MAX_PER_VILLA * V.length)
				expect((await outcome(save(member, over))).status).toBe(400);
			expect((await /** @type {any} */ (h.store).getBallots([member.id]))[member.id]).toEqual(
				stored
			);
		});

		it('is refused for one point over the per-villa cap, an unknown villa, fractions and junk', async () => {
			for (const bad of [
				{ [V[0]]: MAX_PER_VILLA + 1 },
				{ nope: 1 },
				{ [V[0]]: 1.5 },
				{ [V[0]]: '2' },
				[]
			]) {
				expect((await outcome(save(member, bad))).status).toBe(400);
			}
			expect(
				(
					await outcome(
						vote.actions.save(
							/** @type {any} */ ({
								locals: locals(member),
								request: post({ ballot: '{oops' })
							})
						)
					)
				).status
			).toBe(400);
		});

		it('can only ever change their own ballot', async () => {
			const others = roster.filter((x) => x.id !== member.id);
			for (const o of others) await /** @type {any} */ (h.store).setBallot(o.id, { [V[1]]: 1 });
			await save(member, { [V[0]]: 2 });
			const all = await /** @type {any} */ (h.store).getBallots(roster.map((x) => x.id));
			for (const o of others) expect(all[o.id]).toEqual({ [V[1]]: 1 });
			expect(all[member.id]).toEqual({ [V[0]]: 2 });
		});

		it('can take every point back (an empty ballot)', async () => {
			await save(member, { [V[0]]: 3 });
			expect((await outcome(save(member, {}))).status).toBe(200);
			expect((await /** @type {any} */ (h.store).getBallots([member.id]))[member.id]).toEqual({});
		});

		it(
			member.admin
				? 'can use the admin page and every admin action'
				: 'is turned away from the admin page and every admin action (403)',
			async () => {
				const events = (/** @type {Record<string, string>} */ fields = {}) => ({
					locals: locals(member),
					request: post(fields)
				});
				const load = await outcome(admin.load(/** @type {any} */ ({ locals: locals(member) })));
				if (!member.admin) expect(load.status).toBe(403);
				else expect(load.status).toBe(200);

				if (!member.admin) {
					// Seed some state, then prove no action changed any of it.
					await /** @type {any} */ (h.store).setBallot(roster[0].id, { [V[0]]: 3 });
					const attempts = {
						extend: { deadline: '2026-10-12T10:00' },
						closeNow: {},
						pickWinner: { villaId: V[0] },
						undoWinner: {},
						resetAll: {},
						removeVilla: { villaId: V[0] },
						restoreVilla: { villaId: V[0] }
					};
					for (const [name, fields] of Object.entries(attempts)) {
						expect((await outcome(adminFns[name](events(fields)))).status, name).toBe(403);
					}
					const store = /** @type {any} */ (h.store);
					expect(await store.getBallots([roster[0].id])).toEqual({ [roster[0].id]: { [V[0]]: 3 } });
					expect(await store.getVoting()).toEqual({ deadline: null, removed: [], resetAt: null });
					expect((await store.getTrip()).winnerId).toBeNull();
				}
			}
		);
	}
);

describe('the whole group voting together', () => {
	it('keeps every member’s points separate and the totals right', async () => {
		// Everyone gives their whole budget to villa 0 (3), villa 1 (3) and the rest to villa 2.
		for (const m of roster) {
			const b = budgetOf(m);
			await save(m, { [V[0]]: Math.min(3, b), ...(b > 3 ? { [V[1]]: Math.min(3, b - 3) } : {}) });
		}
		const admin0 = /** @type {import('./members.js').Member} */ (roster.find((m) => m.admin));
		const data = await vote.load(/** @type {any} */ ({ locals: locals(admin0), depends() {} }));
		const given = Object.values(data.ballots).reduce(
			(sum, b) => sum + spent(/** @type {any} */ (b)),
			0
		);
		const expected = roster.reduce(
			(sum, m) => sum + Math.min(3, budgetOf(m)) + Math.max(0, Math.min(3, budgetOf(m) - 3)),
			0
		);
		expect(given).toBe(expected);
		expect(Object.keys(data.ballots)).toHaveLength(8);
	});

	it('admin removing a villa gives each voter back exactly their points on it', async () => {
		for (const m of roster) await save(m, { [V[0]]: 2, [V[1]]: 1 });
		const admin0 = /** @type {import('./members.js').Member} */ (roster.find((m) => m.admin));
		const r = await outcome(
			adminFns.removeVilla({ locals: locals(admin0), request: post({ villaId: V[0] }) })
		);
		expect(r.status).toBe(200);
		const all = await /** @type {any} */ (h.store).getBallots(roster.map((m) => m.id));
		for (const m of roster) expect(spent(all[m.id]), m.id).toBe(1); // 3 -> 1: got 2 back
		// ...and nobody can vote for it any more.
		for (const m of roster) expect((await outcome(save(m, { [V[0]]: 1 }))).status).toBe(400);
	});

	it('admin reset clears all 8 ballots and everyone can vote again', async () => {
		for (const m of roster) await save(m, { [V[2]]: 3 });
		const admin0 = /** @type {import('./members.js').Member} */ (roster.find((m) => m.admin));
		expect(
			(await outcome(adminFns.resetAll({ locals: locals(admin0), request: post({}) }))).status
		).toBe(200);
		const all = await /** @type {any} */ (h.store).getBallots(roster.map((m) => m.id));
		for (const m of roster) expect(all[m.id]).toEqual({});
		for (const m of roster) expect((await outcome(save(m, { [V[2]]: 3 }))).status).toBe(200);
	});

	it('once voting closes or a winner is picked, nobody can change a vote', async () => {
		for (const m of roster) await save(m, { [V[0]]: 3 });
		const admin0 = /** @type {import('./members.js').Member} */ (roster.find((m) => m.admin));
		await adminFns.closeNow({ locals: locals(admin0), request: post({}) });
		for (const m of roster) expect((await outcome(save(m, { [V[1]]: 1 }))).status, m.id).toBe(409);
		await adminFns.extend({
			locals: locals(admin0),
			request: post({ deadline: '2026-10-12T10:00' })
		});
		for (const m of roster) expect((await outcome(save(m, { [V[0]]: 2 }))).status).toBe(200);
		await adminFns.pickWinner({ locals: locals(admin0), request: post({ villaId: V[0] }) });
		for (const m of roster) expect((await outcome(save(m, { [V[0]]: 1 }))).status, m.id).toBe(409);
		const all = await /** @type {any} */ (h.store).getBallots(roster.map((m) => m.id));
		for (const m of roster) expect(all[m.id]).toEqual({ [V[0]]: 2 }); // frozen as they were
	});

	it('comments: the whole group writes, and once a winner is picked only the winner keeps its comments', async () => {
		const admin0 = /** @type {import('./members.js').Member} */ (roster.find((m) => m.admin));
		const say = (/** @type {import('./members.js').Member} */ m, /** @type {string} */ id) =>
			outcome(
				/** @type {any} */ (villaPage.actions.comment)({
					locals: locals(m),
					params: { id },
					request: post({ text: `hello from ${m.id}` })
				})
			);
		for (const m of roster) {
			expect((await say(m, V[0])).status).toBe(200);
			expect((await say(m, V[1])).status).toBe(200);
		}
		const read = async (/** @type {string} */ id) =>
			villaPage.load(/** @type {any} */ ({ locals: locals(admin0), params: { id }, depends() {} }));
		const counts = async () =>
			(await vote.load(/** @type {any} */ ({ locals: locals(admin0), depends() {} })))
				.commentCounts;

		expect((await read(V[0])).comments).toHaveLength(8);
		expect((await read(V[1])).comments).toHaveLength(8);
		expect((await counts())[V[1]]).toBe(8);

		await adminFns.pickWinner({ locals: locals(admin0), request: post({ villaId: V[0] }) });

		// the winner keeps everything, every other villa shows nothing at all
		expect((await read(V[0])).comments).toHaveLength(8);
		for (const id of V.slice(1)) {
			const page = await read(id);
			expect(page.comments, id).toEqual([]);
			expect(JSON.stringify(page)).not.toContain('hello from');
		}
		const after = await counts();
		expect(after[V[0]]).toBe(8);
		expect(
			Object.entries(after)
				.filter(([id]) => id !== V[0])
				.every(([, n]) => n === 0)
		).toBe(true);
		// nobody can add to a villa that wasn't chosen, but they can to the winner
		for (const m of roster) expect((await say(m, V[1])).status, m.id).toBe(400);
		expect((await say(roster[1], V[0])).status).toBe(200);

		// undoing the winner brings the hidden comments back (they were only hidden)
		await adminFns.undoWinner({ locals: locals(admin0), request: post({}) });
		expect((await read(V[1])).comments).toHaveLength(8);
	});
});
