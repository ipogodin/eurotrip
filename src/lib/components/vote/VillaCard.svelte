<script>
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { formatDateRange, formatMoney } from '$lib/time.js';

	/**
	 * @type {{
	 *   villa: import('$lib/config/villas.js').Villa,
	 *   rank: number | null,
	 *   total: number,
	 *   voters: { member: import('$lib/members-ui.js').PublicMember, points: number }[],
	 *   myPoints: number,
	 *   canAdd: boolean,
	 *   addHint: string,
	 *   open: boolean,
	 *   winner?: boolean,
	 *   eager?: boolean,
	 *   onchange: (points: number) => void
	 * }}
	 */
	let {
		villa,
		rank,
		total,
		voters,
		myPoints,
		canAdd,
		addHint,
		open,
		winner = false,
		eager = false,
		onchange
	} = $props();

	/** @type {HTMLDivElement | undefined} */
	let strip = $state();

	const perNight = $derived(Math.round(villa.price.total / villa.price.nights));

	/** @param {1 | -1} dir */
	function slide(dir) {
		strip?.scrollBy({ left: dir * strip.clientWidth, behavior: 'smooth' });
	}
</script>

<article class="villa" class:mine={myPoints > 0} class:winner aria-labelledby="v-{villa.id}">
	<div class="media">
		<div class="strip" bind:this={strip}>
			{#each villa.photos as photo, i (photo.src)}
				<img
					src={photo.thumb}
					srcset="{photo.thumb} 480w, {photo.src} {photo.width}w"
					sizes="(min-width: 1100px) 380px, (min-width: 700px) 50vw, 100vw"
					width={photo.width}
					height={photo.height}
					alt={i === 0 ? `${villa.name}, main photo` : ''}
					loading={eager && i === 0 ? 'eager' : 'lazy'}
					decoding="async"
				/>
			{/each}
		</div>
		{#if villa.photos.length > 1}
			<button type="button" class="nav prev" aria-label="Previous photo" onclick={() => slide(-1)}>
				<Icon name="chevron-left" size={18} />
			</button>
			<button type="button" class="nav next" aria-label="Next photo" onclick={() => slide(1)}>
				<Icon name="chevron-right" size={18} />
			</button>
			<span class="count">{villa.photos.length} photos</span>
		{/if}
		{#if winner}
			<span class="sticker gold"><Icon name="trophy" size={14} /> Winner</span>
		{:else if rank}
			<span class="sticker" class:gold={rank === 1}>#{rank}</span>
		{/if}
	</div>

	<div class="body">
		<header>
			<h3 id="v-{villa.id}" class="t-headline">{villa.name}</h3>
			<p class="where">
				<Icon name="pin" size={14} />
				{villa.town}
				{#if villa.rating}<span aria-hidden="true">·</span>
					<span class="star" aria-label="Rated {villa.rating} out of 5"
						>★ {villa.rating.toFixed(Number.isInteger(villa.rating * 10) ? 1 : 2)}</span
					>{/if}
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

		<footer>
			<div class="votes">
				{#if voters.length}
					<ul class="voters" aria-label="Votes for {villa.name}">
						{#each voters as v (v.member.id)}
							<li title="{v.member.short}: {v.points} pt{v.points === 1 ? '' : 's'}">
								<Avatar member={v.member} size={28} ring />
								<span class="pts num" aria-hidden="true">{v.points}</span>
								<span class="sr-only">{v.member.short}, {v.points} points</span>
							</li>
						{/each}
					</ul>
					<span class="total num">{total} pt{total === 1 ? '' : 's'}</span>
				{:else}
					<span class="none">No votes yet</span>
				{/if}
			</div>
			{#if open}
				<Stepper value={myPoints} {canAdd} label={villa.name} {addHint} {onchange} />
			{:else if myPoints}
				<span class="my num">You gave {myPoints}</span>
			{/if}
		</footer>
	</div>
</article>

<style>
	.villa {
		display: grid;
		grid-template-rows: auto 1fr;
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--r-lg);
		overflow: hidden;
		box-shadow: var(--e1);
		transition: border-color var(--t-ui) ease;
	}
	.villa.mine {
		border-color: var(--hibiscus);
	}
	.villa.winner {
		border-color: var(--mango);
		box-shadow:
			0 0 0 4px rgb(255 176 32 / 0.25),
			var(--e1);
	}

	.media {
		position: relative;
		aspect-ratio: 3 / 2;
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
		background: rgb(255 255 255 / 0.88);
		color: var(--ink);
		box-shadow: var(--e1);
		cursor: pointer;
		opacity: 0;
		transition: opacity var(--t-ui) ease;
	}
	.prev {
		left: 8px;
	}
	.next {
		right: 8px;
	}
	.media:hover .nav,
	.nav:focus-visible {
		opacity: 1;
	}
	/* Touch screens swipe; no hover-revealed arrows there. */
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
		font-size: 12px;
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
		color: var(--ink);
	}

	.body {
		display: grid;
		align-content: start;
		gap: var(--s3);
		padding: var(--s4);
	}
	h3 {
		margin: 0;
	}
	.where {
		display: flex;
		align-items: center;
		gap: 4px;
		margin: 2px 0 0;
		color: var(--ink-2);
		font-weight: 700;
		font-size: 14px;
	}
	.star {
		color: var(--ink);
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
		font-size: 14px;
		font-weight: 700;
	}
	.price b {
		color: var(--ink);
		font-size: 22px;
		font-family: var(--font-display);
	}
	.saved {
		color: var(--ink-3);
		font-size: 12px;
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
		padding: 3px 10px;
		border-radius: var(--r-pill);
		background: var(--sea-soft);
		color: #055c61;
		font-size: 13px;
		font-weight: 800;
	}
	.blurb {
		margin: 0;
		color: var(--ink-2);
		font-size: 15px;
		line-height: 22px;
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

	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s3);
		padding-top: var(--s3);
		border-top: 2px dashed var(--line);
	}
	.votes {
		display: flex;
		align-items: center;
		gap: var(--s2);
		min-width: 0;
	}
	.voters {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.voters li {
		position: relative;
	}
	.pts {
		position: absolute;
		right: -4px;
		bottom: -4px;
		display: grid;
		place-items: center;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--mango);
		color: var(--ink);
		font-size: 10px;
		font-weight: 900;
	}
	.total {
		font-weight: 900;
		white-space: nowrap;
	}
	.none {
		color: var(--ink-3);
		font-size: 14px;
		font-weight: 700;
	}
	.my {
		font-weight: 800;
		color: var(--hibiscus);
	}
</style>
