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
		gap: 8px;
	}
	.segs {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 5px;
	}
	.seg {
		height: 12px;
		border-radius: var(--r-pill);
		background: var(--line);
		box-shadow: inset 0 0 0 1.5px #ecd3a6;
		transition: background var(--t-ui) var(--ease);
	}
	.seg.on {
		background: var(--grad-sun);
		box-shadow: 0 2px 6px rgb(255 122 61 / 0.4);
		animation: bloom 380ms var(--spring);
	}
	.label {
		font-size: 14px;
		line-height: 20px;
		font-weight: 700;
		color: var(--ink-2);
	}
	.label strong {
		color: var(--hibiscus);
		font-size: 17px;
		font-weight: 900;
	}
	@keyframes bloom {
		from {
			transform: scaleY(0.5);
		}
	}
</style>
