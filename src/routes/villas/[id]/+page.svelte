<script>
	import { resolve } from '$app/paths';
	import { BallotClient } from '$lib/ballot-client.svelte.js';
	import AppBar from '$lib/components/ui/AppBar.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import PointsLeft from '$lib/components/vote/PointsLeft.svelte';
	import ResetVotes from '$lib/components/vote/ResetVotes.svelte';
	import VoteBar from '$lib/components/vote/VoteBar.svelte';
	import { findVilla, villas } from '$lib/config/villas.js';
	import { withCallName } from '$lib/members-ui.js';
	import Icon from '$lib/icons/Icon.svelte';
	import { formatDateRange, formatMoney } from '$lib/time.js';
	import { buildVoteView } from '$lib/vote-view.js';
	import { useAdminNotices, useVotePolling } from '$lib/vote-polling.svelte.js';
	import { spent } from '$lib/voting.js';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const client = new BallotClient(() => data.ballots[data.me] ?? {});
	$effect(() => () => client.destroy());

	const open = $derived(data.state === 'open');
	const myBallot = $derived(client.ballot);
	const view = $derived(
		buildVoteView({
			villas: villas.filter((v) => !data.removed.includes(v.id)),
			members: withCallName(data.members, data.member),
			ballots: data.ballots,
			me: data.me,
			myBallot
		})
	);
	/** The villa's facts always exist in the config; its vote row only while it's on the list. */
	const villa = $derived(
		/** @type {import('$lib/config/villas.js').Villa} */ (findVilla(data.villaId))
	);
	const row = $derived(view.rowById.get(villa.id));
	const perNight = $derived(Math.round(villa.price.total / villa.price.nights));
	const isWinner = $derived(data.winnerId === villa.id);
	/** Voting is over: the page is about the chosen villa; the others weren't chosen. */
	const decided = $derived(data.state === 'decided');
	const notChosen = $derived(decided && !isWinner);
	const winnerVilla = $derived(data.winnerId ? findVilla(data.winnerId) : undefined);

	useAdminNotices({
		resetAt: () => data.resetAt,
		removed: () => data.removed,
		myBallot: () => data.ballots[data.me] ?? {},
		budget: () => view.myBudget,
		villaName: (id) => villas.find((v) => v.id === id)?.name ?? 'A villa'
	});

	useVotePolling({
		busy: () => client.busy,
		deadline: () => data.deadline,
		open: () => open
	});

	/** @type {HTMLDivElement | undefined} */
	let strip = $state();
	let index = $state(0);

	function onScroll() {
		if (strip) index = Math.round(strip.scrollLeft / strip.clientWidth);
	}

	/** @param {1 | -1} dir */
	function slide(dir) {
		strip?.scrollBy({ left: dir * strip.clientWidth, behavior: 'smooth' });
	}
</script>

<svelte:head><title>{villa.name} · Eurotrip</title></svelte:head>

<AppBar member={data.member} nav={[{ href: '/vote', label: 'Villas' }]} current="/vote">
	{#if open}
		<PointsLeft spent={spent(myBallot)} budget={view.myBudget} />
		{#if spent(myBallot) > 0}
			<ResetVotes bar budget={view.myBudget} onreset={() => client.reset()} />
		{/if}
	{/if}
</AppBar>

<main class="page stack">
	<a class="back" href={resolve('/vote')}>
		<Icon name="chevron-left" size={18} /> Back to the map
	</a>

	{#if !row}
		<div class="gone" role="status">
			<h1 class="t-title">{villa.name} was removed</h1>
			<p>The admin took this villa off the list, so it can't get votes any more.</p>
			<a class="btn btn-primary" href={resolve('/vote')}>Back to the map</a>
		</div>
	{:else if notChosen}
		<div class="gone" role="status">
			<h1 class="t-title">{villa.name} wasn't chosen</h1>
			<p>
				Voting is over{#if winnerVilla}: we're staying at <b>{winnerVilla.name}</b>{/if}.
			</p>
			{#if winnerVilla}
				<a class="btn btn-primary" href={resolve('/villas/[id]', { id: winnerVilla.id })}>
					See our villa
				</a>
			{/if}
		</div>
	{:else}
		<article class="villa" class:winner={isWinner} aria-labelledby="title">
			<div class="media">
				<div
					class="strip"
					bind:this={strip}
					onscroll={onScroll}
					role="group"
					aria-label="Photos of {villa.name}"
				>
					{#each villa.photos as photo, i (photo.src)}
						<img
							src={photo.src}
							srcset="{photo.thumb} 480w, {photo.src} {photo.width}w"
							sizes="(min-width: 900px) 880px, 100vw"
							width={photo.width}
							height={photo.height}
							alt="{villa.name}, photo {i + 1} of {villa.photos.length}"
							loading={i === 0 ? 'eager' : 'lazy'}
							fetchpriority={i === 0 ? 'high' : undefined}
							decoding="async"
						/>
					{/each}
				</div>
				{#if villa.photos.length > 1}
					<button
						type="button"
						class="nav prev"
						aria-label="Previous photo"
						onclick={() => slide(-1)}
					>
						<Icon name="chevron-left" size={20} />
					</button>
					<button type="button" class="nav next" aria-label="Next photo" onclick={() => slide(1)}>
						<Icon name="chevron-right" size={20} />
					</button>
					<span class="count num">{index + 1} / {villa.photos.length}</span>
				{/if}
				{#if isWinner}
					<span class="sticker gold"><Icon name="trophy" size={14} /> Winner</span>
				{:else if row.rank}
					<span class="sticker" class:gold={row.rank === 1}>#{row.rank}</span>
				{/if}
			</div>

			{#if !decided}
				<VoteBar
					name={villa.name}
					voters={row.voters}
					total={row.total}
					myPoints={row.myPoints}
					canAdd={row.canAdd}
					addHint={row.addHint}
					{open}
					onchange={(points) => client.set(villa.id, points)}
				/>
			{/if}

			<div class="body">
				<header>
					<h1 id="title" class="t-title">{villa.name}</h1>
					<p class="where">
						<Icon name="pin" size={14} />
						{villa.town}, {villa.island}
						{#if villa.rating}
							<span aria-hidden="true">·</span>
							<span aria-label="Rated {villa.rating} out of 5"
								>★ {villa.rating.toFixed(Number.isInteger(villa.rating * 10) ? 1 : 2)}</span
							>
						{/if}
					</p>
				</header>

				<div class="chips">
					<Chip icon="bed">{villa.bedrooms} bedrooms</Chip>
					<Chip icon="bath">{villa.bathrooms} baths</Chip>
					<Chip icon="users">Sleeps {villa.sleeps}</Chip>
				</div>

				<p class="price">
					<b class="num">{formatMoney(villa.price.total, villa.price.currency)}</b>
					<span
						>for {villa.price.nights} nights · ≈ {formatMoney(
							perNight,
							villa.price.currency
						)}/night</span
					>
					{#if villa.dates}
						<span class="saved"
							>Airbnb price for {formatDateRange(villa.dates)}, not our final dates</span
						>
					{/if}
				</p>

				<ul class="highlights" aria-label="Highlights">
					{#each villa.highlights as h (h)}
						<li>{h}</li>
					{/each}
				</ul>

				<p class="blurb">{villa.blurb}</p>

				<a class="listing" href={villa.url} target="_blank" rel="external noopener noreferrer">
					See it on Airbnb <Icon name="external" size={14} />
				</a>
			</div>
		</article>
	{/if}
</main>

<style>
	.page {
		max-width: 880px;
	}
	.gone {
		display: grid;
		justify-items: start;
		gap: var(--s3);
		padding: var(--s6);
		background: var(--surface);
		border: 2px dashed var(--line);
		border-radius: var(--r-lg);
	}
	.gone h1,
	.gone p {
		margin: 0;
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		justify-self: start;
		min-height: 44px;
		color: var(--lagoon-deep);
		font-weight: 800;
	}
	.villa {
		display: grid;
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--r-lg);
		overflow: hidden;
		box-shadow: var(--e1);
	}
	.villa.winner {
		border-color: var(--mango);
		box-shadow:
			0 0 0 4px rgb(255 176 32 / 0.25),
			var(--e1);
	}
	.media {
		position: relative;
		width: 100%;
		aspect-ratio: 3 / 2;
		/* Never so tall that the vote buttons below fall off the screen. */
		max-height: max(240px, calc(100dvh - 270px));
		background: var(--surface-2);
	}
	.strip {
		display: flex;
		height: 100%;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		overscroll-behavior-x: contain;
	}
	.strip::-webkit-scrollbar {
		display: none;
	}
	.strip img {
		flex: 0 0 100%;
		width: 100%;
		height: 100%;
		object-fit: cover;
		scroll-snap-align: start;
	}
	.nav {
		position: absolute;
		top: 50%;
		translate: 0 -50%;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: 0;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.9);
		color: var(--ink);
		box-shadow: var(--e1);
		cursor: pointer;
	}
	.prev {
		left: 10px;
	}
	.next {
		right: 10px;
	}
	/* Touch screens swipe; arrows are for mouse users. */
	@media (hover: none) {
		.nav {
			display: none;
		}
	}
	.count {
		position: absolute;
		right: 10px;
		bottom: 10px;
		padding: 2px 10px;
		border-radius: var(--r-pill);
		background: rgb(12 59 62 / 0.72);
		color: #fff;
		font-size: 13px;
		font-weight: 800;
	}
	.sticker {
		position: absolute;
		left: 10px;
		top: 10px;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-width: 40px;
		height: 32px;
		padding: 0 10px;
		justify-content: center;
		border-radius: var(--r-pill);
		background: #fff;
		color: var(--ink);
		font-weight: 900;
		box-shadow: var(--e1);
	}
	.sticker.gold {
		background: var(--grad-sun);
	}

	.body {
		display: grid;
		align-content: start;
		gap: var(--s3);
		padding: var(--s5) var(--s4) var(--s6);
	}
	h1 {
		margin: 0;
	}
	.where {
		display: flex;
		align-items: center;
		gap: 4px;
		margin: 4px 0 0;
		color: var(--ink-2);
		font-weight: 700;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.price {
		display: grid;
		margin: 0;
		color: var(--ink-2);
		font-weight: 700;
	}
	.price b {
		color: var(--ink);
		font-size: 26px;
		font-family: var(--font-display);
	}
	.saved {
		color: var(--ink-3);
		font-size: 13px;
		font-weight: 600;
	}
	.highlights {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.highlights li {
		padding: 3px 12px;
		border-radius: var(--r-pill);
		background: var(--sea-soft);
		color: #055c61;
		font-size: 14px;
		font-weight: 800;
	}
	.blurb {
		margin: 0;
		color: var(--ink-2);
		line-height: 26px;
	}
	.listing {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 44px;
		color: var(--lagoon-deep);
		font-weight: 800;
	}
</style>
