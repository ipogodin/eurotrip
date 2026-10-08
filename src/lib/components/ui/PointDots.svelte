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
		gap: 5px;
	}
	.dot {
		width: var(--d);
		height: var(--d);
		border-radius: 50%;
		background: var(--line);
		box-shadow: inset 0 0 0 2px #ecd3a6;
	}
	.on {
		background: radial-gradient(circle at 35% 30%, #ffe08a, #ff9a1f 70%);
		box-shadow: 0 0 0 3px rgb(255 176 32 / 0.28);
		animation: bloom 380ms var(--spring);
	}
	@keyframes bloom {
		from {
			transform: scale(0.4);
		}
	}
</style>
