<script>
	import PointsMeter from '$lib/components/ui/PointsMeter.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import { VOTE_BUDGET } from '$lib/config/voting.js';

	/**
	 * @type {{
	 *   rows: import('./types.js').VillaRow[],
	 *   spent: number,
	 *   open: boolean,
	 *   onchange: (villaId: string, points: number) => void,
	 *   villasHref: string
	 * }}
	 */
	let { rows, spent, open, onchange, villasHref } = $props();
</script>

<div class="stack">
	{#if rows.length === 0}
		<div class="empty">
			<p class="t-headline">No votes yet</p>
			<p>
				{#if open}
					Browse the villas and tap <b>+</b> on the ones you like. You have {VOTE_BUDGET} points.
				{:else}
					You didn't vote before voting closed.
				{/if}
			</p>
			{#if open}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- same-page `?view=` link -->
				<a class="btn btn-primary" href={villasHref}>See the villas</a>
			{/if}
		</div>
	{:else}
		<ul class="mine">
			{#each rows as row (row.villa.id)}
				<li>
					{#if row.villa.photos[0]}
						<img
							src={row.villa.photos[0].thumb}
							alt=""
							width="96"
							height="64"
							loading="lazy"
							decoding="async"
						/>
					{/if}
					<div class="info">
						<p class="name">{row.villa.name}</p>
						<p class="meta">
							{row.villa.town} · {row.total} pt{row.total === 1 ? '' : 's'} from everyone
							{#if row.rank}· #{row.rank}{/if}
						</p>
					</div>
					{#if open}
						<Stepper
							value={row.myPoints}
							canAdd={row.canAdd}
							label={row.villa.name}
							addHint={row.addHint}
							onchange={(points) => onchange(row.villa.id, points)}
						/>
					{:else}
						<span class="pts num">{row.myPoints}</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if open}
		<div class="sticky">
			<PointsMeter {spent} />
		</div>
	{/if}
</div>

<style>
	.empty {
		display: grid;
		justify-items: start;
		gap: var(--s2);
		padding: var(--s6);
		background: var(--surface);
		border: 2px dashed var(--line);
		border-radius: var(--r-lg);
	}
	.empty p {
		margin: 0;
	}
	.mine {
		display: grid;
		gap: var(--s3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.mine li {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--s3);
		padding: var(--s3);
		background: var(--surface);
		border: 2px solid var(--hibiscus);
		border-radius: var(--r-md);
	}
	img {
		width: 72px;
		height: 56px;
		object-fit: cover;
		border-radius: var(--r-sm);
	}
	.info {
		min-width: 0;
	}
	.name,
	.meta {
		margin: 0;
	}
	.name {
		font-weight: 900;
	}
	.meta {
		color: var(--ink-2);
		font-size: 13px;
		font-weight: 700;
	}
	.pts {
		font-size: 22px;
		font-weight: 900;
		color: var(--hibiscus);
	}
	.sticky {
		position: sticky;
		bottom: calc(var(--bottomnav-h) + var(--s3) + env(safe-area-inset-bottom));
		padding: var(--s3) var(--s4);
		background: rgb(255 255 255 / 0.94);
		backdrop-filter: blur(12px);
		border: 2px solid var(--line);
		border-radius: var(--r-pill);
		box-shadow: var(--e2);
	}
	@media (min-width: 768px) {
		.sticky {
			bottom: var(--s4);
		}
		.mine li {
			grid-template-columns: auto 1fr auto;
		}
		img {
			width: 96px;
			height: 64px;
		}
	}
</style>
