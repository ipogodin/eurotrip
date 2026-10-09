<script>
	import { resolve } from '$app/paths';
	import Chip from '$lib/components/ui/Chip.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	/**
	 * The chosen villa, in short, under the map once voting is over.
	 * @type {{ villa: import('$lib/config/villas.js').Villa }}
	 */
	let { villa } = $props();
</script>

<section class="winner" aria-labelledby="winner-title">
	<p class="eyebrow"><Icon name="trophy" size={14} /> Our villa</p>
	<h2 id="winner-title" class="t-title">{villa.name}</h2>
	<p class="where"><Icon name="pin" size={14} /> {villa.town}, {villa.island}</p>
	<Chip tone={villa.exactLocation ? 'sea' : 'sun'} icon="pin">
		{villa.exactLocation ? 'Exact location' : 'Approximate area'}
	</Chip>
	<div class="chips">
		<Chip icon="bed">{villa.bedrooms} bedrooms</Chip>
		<Chip icon="bath">{villa.bathrooms} baths</Chip>
		<Chip icon="users">Sleeps {villa.sleeps}</Chip>
	</div>
	<ul class="highlights" aria-label="Highlights">
		{#each villa.highlights as h (h)}<li>{h}</li>{/each}
	</ul>
	<p class="blurb">{villa.blurb}</p>
	<a class="btn btn-primary" href={resolve('/villas/[id]', { id: villa.id })}>
		See the photos and details
	</a>
</section>

<style>
	.winner {
		display: grid;
		justify-items: start;
		gap: var(--s3);
		padding: var(--s5);
		background: var(--surface);
		border: 2px solid var(--mango);
		border-radius: var(--r-lg);
		box-shadow:
			0 0 0 4px rgb(255 176 32 / 0.25),
			var(--e1);
	}
	.winner > * {
		margin: 0;
	}
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 900;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--lagoon-deep);
	}
	.where {
		display: flex;
		align-items: center;
		gap: 4px;
		color: var(--ink-2);
		font-weight: 700;
	}
	.chips,
	.highlights {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
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
		color: var(--ink-2);
		line-height: 26px;
	}
</style>
