<script>
	/** Sun mark / decoration. */
	/** @type {{ size?: number, rays?: boolean }} */
	let { size = 28, rays = true } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
	<defs>
		<linearGradient id="sun-g" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#ffd25a" />
			<stop offset="1" stop-color="#ff6a3d" />
		</linearGradient>
	</defs>
	{#if rays}
		<g stroke="#ffb020" stroke-width="3" stroke-linecap="round">
			{#each { length: 8 }, i (i)}
				<line x1="24" y1="3" x2="24" y2="8" transform="rotate({i * 45} 24 24)" />
			{/each}
		</g>
	{/if}
	<circle cx="24" cy="24" r={rays ? 12 : 20} fill="url(#sun-g)" />
</svg>
