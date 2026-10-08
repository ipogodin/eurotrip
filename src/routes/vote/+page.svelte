<script>
	import { untrack } from 'svelte';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { BallotClient } from '$lib/ballot-client.svelte.js';
	import AppBar from '$lib/components/ui/AppBar.svelte';
	import BottomNav from '$lib/components/ui/BottomNav.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import MyVotes from '$lib/components/vote/MyVotes.svelte';
	import PeopleList from '$lib/components/vote/PeopleList.svelte';
	import VillaGrid from '$lib/components/vote/VillaGrid.svelte';
	import VoteHeader from '$lib/components/vote/VoteHeader.svelte';
	import { villas } from '$lib/config/villas.js';
	import { MAX_PER_VILLA, VOTE_BUDGET } from '$lib/config/voting.js';
	import { canIncrement, spent, tally } from '$lib/voting.js';

	/** @typedef {import('$lib/components/vote/types.js').VillaRow} VillaRow */
	/** @typedef {'villas' | 'people' | 'mine'} View */

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const POLL_MS = 15_000;
	/** Don't re-sort cards under someone's finger: wait this long after a tap. */
	const RESORT_IDLE_MS = 5_000;

	/** @type {{ value: View, label: string, icon: import('$lib/icons/paths.js').IconName }[]} */
	const VIEWS = [
		{ value: 'villas', label: 'Villas', icon: 'home' },
		{ value: 'people', label: 'People', icon: 'users' },
		{ value: 'mine', label: 'My votes', icon: 'check' }
	];

	const view = $derived(
		/** @type {View} */ (
			VIEWS.find((v) => v.value === page.url.searchParams.get('view'))?.value ?? 'villas'
		)
	);

	const client = new BallotClient(() => data.ballots[data.me] ?? {});
	$effect(() => () => client.destroy());

	const villaById = new Map(villas.map((v) => [v.id, v]));
	const memberById = $derived(new Map(data.members.map((m) => [m.id, m])));

	const open = $derived(data.state === 'open');
	const myBallot = $derived(client.ballot);
	const mySpent = $derived(spent(myBallot));
	// My unsaved taps count immediately, everyone else's come from the server.
	const results = $derived(tally({ ...data.ballots, [data.me]: myBallot }, villas, data.members));

	/** @type {Map<string, VillaRow>} */
	const rowById = $derived(
		new Map(
			results.byVilla.flatMap((r) => {
				const villa = villaById.get(r.villaId);
				if (!villa) return [];
				const myPoints = myBallot[r.villaId] ?? 0;
				/** @type {VillaRow} */
				const row = {
					villa,
					rank: r.rank,
					total: r.total,
					voters: r.voters.flatMap((v) => {
						const member = memberById.get(v.memberId);
						return member ? [{ member, points: v.points }] : [];
					}),
					myPoints,
					canAdd: canIncrement(myBallot, r.villaId),
					addHint:
						myPoints >= MAX_PER_VILLA
							? `${MAX_PER_VILLA} points is the most one villa can get from you.`
							: `All ${VOTE_BUDGET} points are used. Take one back from another villa first.`
				};
				return [[r.villaId, row]];
			})
		)
	);

	// Card order: ranking, but frozen while someone is tapping.
	/** @type {string[]} */
	let order = $state([]);
	let lastTap = 0;
	$effect(() => {
		const ranked = results.byVilla.map((r) => r.villaId);
		const busy = client.busy;
		untrack(() => {
			if (order.length === 0 || (!busy && Date.now() - lastTap > RESORT_IDLE_MS)) order = ranked;
		});
	});

	const villaRows = $derived.by(() => {
		const ids = order.length ? order : results.byVilla.map((r) => r.villaId);
		const rows = ids.flatMap((id) => rowById.get(id) ?? []);
		// Once decided, the winner leads.
		const w = rows.findIndex((r) => r.villa.id === data.winnerId);
		if (w > 0) rows.unshift(...rows.splice(w, 1));
		return rows;
	});

	const myRows = $derived(
		villaRows.filter((r) => r.myPoints > 0).sort((a, b) => b.myPoints - a.myPoints)
	);

	const people = $derived(
		results.byPerson.flatMap((p) => {
			const member = memberById.get(p.memberId);
			if (!member) return [];
			const picks = p.picks.flatMap((x) => {
				const villa = villaById.get(x.villaId);
				return villa ? [{ villa, points: x.points }] : [];
			});
			return [{ member, spent: p.spent, left: p.left, picks }];
		})
	);
	const notVoted = $derived(results.notVotedYet.flatMap((id) => memberById.get(id) ?? []));

	const winnerName = $derived(
		data.winnerId ? (villaById.get(data.winnerId)?.name ?? 'the winning villa') : null
	);

	/**
	 * @param {string} villaId
	 * @param {number} points
	 */
	function vote(villaId, points) {
		if (!open) return;
		lastTap = Date.now();
		client.set(villaId, points);
	}

	/** @param {View} v */
	function viewHref(v) {
		// Query-only links stay on /vote (and keep the base path) by definition.
		return `?view=${v}`;
	}

	/** @param {string} v */
	function showView(v) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- same-page `?view=` change
		goto(viewHref(/** @type {View} */ (v)), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	// Everyone else's votes: refresh every 15 s and when the tab comes back,
	// but never while my own save is pending (it would flash old data).
	$effect(() => {
		const refresh = () => {
			if (document.visibilityState === 'visible' && !client.busy) invalidate('app:votes');
		};
		const id = setInterval(refresh, POLL_MS);
		document.addEventListener('visibilitychange', refresh);
		return () => {
			clearInterval(id);
			document.removeEventListener('visibilitychange', refresh);
		};
	});

	// Flip to "closed" right at the deadline instead of waiting for a poll.
	$effect(() => {
		if (data.state !== 'open') return;
		const ms = Date.parse(data.deadline) - Date.now();
		if (ms > 2 ** 31 - 1) return; // beyond setTimeout's range; polling covers it
		const id = setTimeout(() => invalidate('app:votes'), Math.max(0, ms) + 1000);
		return () => clearTimeout(id);
	});
</script>

<svelte:head><title>Vote for the villa · Eurotrip</title></svelte:head>

<AppBar member={data.member} nav={[{ href: '/vote', label: 'Villas' }]} current="/vote" />

<VoteHeader
	name={data.member?.short ?? ''}
	deadline={data.deadline}
	state={data.state}
	{winnerName}
	{mySpent}
/>

<main class="page stack">
	<div class="views">
		<SegmentedControl options={VIEWS} value={view} label="Show" onchange={showView} />
	</div>

	{#if view === 'people'}
		<h2 class="sr-only">Who voted for what</h2>
		<PeopleList {people} {notVoted} me={data.me} />
	{:else if view === 'mine'}
		<h2 class="sr-only">My votes</h2>
		<MyVotes rows={myRows} spent={mySpent} {open} onchange={vote} villasHref={viewHref('villas')} />
	{:else}
		<h2 class="sr-only">Villas, most votes first</h2>
		<VillaGrid rows={villaRows} {open} winnerId={data.winnerId} onchange={vote} />
	{/if}
</main>

<BottomNav
	current="/vote{viewHref(view)}"
	items={VIEWS.map((v) => ({ href: `/vote${viewHref(v.value)}`, label: v.label, icon: v.icon }))}
/>

<style>
	.views {
		display: flex;
		justify-content: center;
	}
	@media (max-width: 767px) {
		/* The bottom nav switches views on phones. */
		.views {
			display: none;
		}
	}
</style>
