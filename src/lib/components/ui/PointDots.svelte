<script>
	/** @type {{ value: number, max?: number, size?: number }} */
	let { value, max = 3, size = 10 } = $props();
</script>

<span class="dots" style:--d="{size}px" role="img" aria-label="{value} of {max} points">
	{#each { length: max }, i (i)}
		<span class="dot" class:on={i < value}></span>
	{/each}
</span>

<style>
	.dots {
		display: inline-flex;
		gap: 4px;
	}
	.dot {
		width: var(--d);
		height: var(--d);
		border-radius: 50%;
		background: var(--line);
		transition: background var(--t-ui) var(--ease);
	}
	.on {
		background: var(--accent);
	}
</style>
