<!--
	Compact "points left" pill for the sticky app bar, so the count stays in
	view while scrolling through villas. The hero's PointsMeter announces
	changes to screen readers; this one stays quiet to avoid saying it twice.
-->
<script>
	import Sun from '$lib/components/ui/Sun.svelte';

	/** @type {{ spent: number, budget: number }} */
	let { spent, budget } = $props();

	const left = $derived(Math.max(0, budget - spent));
</script>

<span class="left num" class:out={left === 0} title="{left} of {budget} points left">
	<Sun size={18} rays={false} />
	<span><b>{left}</b> <span class="of">of {budget}</span> left</span>
</span>

<style>
	.left {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 32px;
		padding: 0 12px 0 8px;
		border-radius: var(--r-pill);
		background: var(--sun-soft);
		color: var(--ink);
		font-size: 14px;
		font-weight: 800;
		white-space: nowrap;
	}
	b {
		font-size: 16px;
		font-weight: 900;
		color: var(--hibiscus);
	}
	.out {
		background: var(--accent-soft);
	}
	@media (max-width: 380px) {
		.of {
			display: none;
		}
	}
</style>
