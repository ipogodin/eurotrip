<script>
	import { ICONS } from './paths.js';

	/** @type {{ name: import('./paths.js').IconName, size?: number, label?: string }} */
	let { name, size = 20, label } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	<path d={ICONS[name]} />
</svg>

<style>
	svg {
		flex: none;
	}
</style>
