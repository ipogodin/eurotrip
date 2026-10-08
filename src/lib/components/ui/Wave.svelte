<script>
	/** Wavy section divider. Fill with currentColor (set `color` on the parent). */
	/** @type {{ flip?: boolean, height?: number }} */
	let { flip = false, height = 36 } = $props();
</script>

<svg
	class="wave"
	viewBox="0 0 1200 60"
	preserveAspectRatio="none"
	style:height="{height}px"
	style:transform={flip ? 'scaleY(-1)' : undefined}
	aria-hidden="true"
	focusable="false"
>
	<path
		fill="currentColor"
		d="M0 30 C150 0 300 0 450 22 C600 44 750 54 900 30 C1010 12 1110 8 1200 24 L1200 60 L0 60 Z"
	/>
</svg>

<style>
	.wave {
		display: block;
		width: 100%;
	}
</style>
