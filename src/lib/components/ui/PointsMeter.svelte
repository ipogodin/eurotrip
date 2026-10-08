<script>
	/** @type {{ spent: number, budget?: number }} */
	let { spent, budget = 6 } = $props();

	const left = $derived(Math.max(0, budget - spent));
</script>

<div class="meter">
	<div class="segs" aria-hidden="true">
		{#each { length: budget }, i (i)}
			<span class="seg" class:on={i < spent}></span>
		{/each}
	</div>
	<p class="label num" role="status">
		<strong>{left}</strong> of {budget} points left
	</p>
</div>

<style>
	.meter {
		display: grid;
		gap: 6px;
	}
	.segs {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 4px;
	}
	.seg {
		height: 8px;
		border-radius: var(--r-pill);
		background: var(--line);
		transition: background var(--t-ui) var(--ease);
	}
	.seg.on {
		background: var(--accent);
	}
	.label {
		font-size: 13px;
		line-height: 18px;
		color: var(--ink-2);
	}
	.label strong {
		color: var(--ink);
	}
</style>
