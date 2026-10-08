<script>
	import VillaCard from './VillaCard.svelte';

	/**
	 * @type {{
	 *   rows: import('./types.js').VillaRow[],
	 *   open: boolean,
	 *   winnerId: string | null,
	 *   onchange: (villaId: string, points: number) => void
	 * }}
	 */
	let { rows, open, winnerId, onchange } = $props();
</script>

<div class="grid">
	{#each rows as row, i (row.villa.id)}
		<VillaCard
			{...row}
			{open}
			winner={row.villa.id === winnerId}
			eager={i < 2}
			onchange={(points) => onchange(row.villa.id, points)}
		/>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		gap: var(--s5);
	}
	@media (min-width: 700px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1100px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
