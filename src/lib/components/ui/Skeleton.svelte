<script>
	/** @type {{ width?: string, height?: string, radius?: string }} */
	let { width = '100%', height = '16px', radius = 'var(--r-sm)' } = $props();
</script>

<span class="sk" style:width style:height style:border-radius={radius} aria-hidden="true"></span>

<style>
	.sk {
		display: block;
		background: linear-gradient(90deg, var(--surface-2) 25%, #fff6e2 50%, var(--surface-2) 75%);
		background-size: 200% 100%;
		animation: shimmer 1.4s infinite linear;
	}
	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}
</style>
