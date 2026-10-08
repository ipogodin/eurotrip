<script>
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { BallotClient } from '$lib/ballot-client.svelte.js';
	import AppBar from '$lib/components/ui/AppBar.svelte';
	import BottomNav from '$lib/components/ui/BottomNav.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import MyVotes from '$lib/components/vote/MyVotes.svelte';
	import PeopleList from '$lib/components/vote/PeopleList.svelte';
	import PointsLeft from '$lib/components/vote/PointsLeft.svelte';
	import VillaGrid from '$lib/components/vote/VillaGrid.svelte';
	import VillaMap from '$lib/components/vote/VillaMap.svelte';
	import VoteHeader from '$lib/components/vote/VoteHeader.svelte';
	import { villas } from '$lib/config/villas.js';
	import { VOTE_LAYOUT } from '$lib/config/voting.js';
	import { useVotePolling } from '$lib/vote-polling.svelte.js';
	import { buildVoteView } from '$lib/vote-view.js';
	import { spent } from '$lib/voting.js';

	/** @typedef {'villas' | 'people' | 'mine'} View */

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	/** Don't re-sort cards under someone's finger: wait this long after a tap. */
	const RESORT_IDLE_MS = 5_000;

	/** The Villas view is the Tenerife map, or (VOTE_LAYOUT = 'list') the old card grid. */
	const MAP = VOTE_LAYOUT === 'map';

	/** @type {{ value: View, label: string, icon: import('$lib/icons/paths.js').IconName }[]} */
	const VIEWS = [
		MAP
			? { value: 'villas', label: 'Map', icon: 'map' }
			: { value: 'villas', label: 'Villas', icon: 'home' },
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
	const open = $derived(data.state === 'open');
	const myBallot = $derived(client.ballot);
	const mySpent = $derived(spent(myBallot));
	// My unsaved taps count immediately; everyone else's come from the server.
	const vv = $derived(
		buildVoteView({ villas, members: data.members, ballots: data.ballots, me: data.me, myBallot })
	);

	// Card order (list layout): ranking, but frozen while someone is tapping.
	/** @type {string[]} */
	let order = $state([]);
	let lastTap = 0;
	$effect(() => {
		const ranked = vv.results.byVilla.map((r) => r.villaId);
		const busy = client.busy;
		untrack(() => {
			if (order.length === 0 || (!busy && Date.now() - lastTap > RESORT_IDLE_MS)) order = ranked;
		});
	});

	const villaRows = $derived.by(() => {
		const ids = order.length ? order : vv.results.byVilla.map((r) => r.villaId);
		const rows = ids.flatMap((id) => vv.rowById.get(id) ?? []);
		// Once decided, the winner leads.
		const w = rows.findIndex((r) => r.villa.id === data.winnerId);
		if (w > 0) rows.unshift(...rows.splice(w, 1));
		return rows;
	});

	const myRows = $derived(
		villaRows.filter((r) => r.myPoints > 0).sort((a, b) => b.myPoints - a.myPoints)
	);

	const people = $derived(
		vv.results.byPerson.flatMap((p) => {
			const member = vv.memberById.get(p.memberId);
			if (!member) return [];
			const picks = p.picks.flatMap((x) => {
				const villa = villaById.get(x.villaId);
				return villa ? [{ villa, points: x.points }] : [];
			});
			return [{ member, spent: p.spent, left: p.left, picks }];
		})
	);
	const notVoted = $derived(vv.results.notVotedYet.flatMap((id) => vv.memberById.get(id) ?? []));

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

	useVotePolling({
		busy: () => client.busy,
		deadline: () => data.deadline,
		open: () => open
	});
</script>

<svelte:head><title>Vote for the villa · Eurotrip</title></svelte:head>

<AppBar member={data.member} nav={[{ href: '/vote', label: 'Villas' }]} current="/vote">
	{#if open}<PointsLeft spent={mySpent} budget={vv.myBudget} />{/if}
</AppBar>

<VoteHeader
	name={data.member?.short ?? ''}
	deadline={data.deadline}
	state={data.state}
	{winnerName}
	{mySpent}
	budget={vv.myBudget}
	compact={MAP}
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
		<MyVotes
			rows={myRows}
			spent={mySpent}
			budget={vv.myBudget}
			{open}
			onchange={vote}
			onreset={() => client.reset()}
			villasHref={viewHref('villas')}
		/>
	{:else}
		{#if MAP}
			<h2 class="sr-only">Map of the villas</h2>
			<VillaMap rows={villaRows} winnerId={data.winnerId} />
		{:else}
			<h2 class="sr-only">Villas, most votes first</h2>
			<VillaGrid rows={villaRows} {open} winnerId={data.winnerId} onchange={vote} />
		{/if}
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
