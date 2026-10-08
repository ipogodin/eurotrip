<script>
	import { resolve } from '$app/paths';
	import Icon from '$lib/icons/Icon.svelte';

	/**
	 * @type {{
	 *   items: { href: string, label: string, icon: import('$lib/icons/paths.js').IconName }[],
	 *   current: string
	 * }}
	 */
	let { items, current } = $props();
</script>

<nav class="bottom" aria-label="Primary">
	{#each items as item (item.href)}
		<a
			href={resolve(/** @type {any} */ (item.href))}
			aria-current={current === item.href ? 'page' : undefined}
		>
			<Icon name={item.icon} size={22} />
			<span>{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	.bottom {
		position: fixed;
		z-index: 40;
		left: 12px;
		right: 12px;
		bottom: calc(12px + env(safe-area-inset-bottom));
		height: 64px;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		padding: 6px;
		background: rgb(255 255 255 / 0.9);
		backdrop-filter: blur(16px) saturate(1.4);
		border: 2px solid var(--line);
		border-radius: var(--r-pill);
		box-shadow: var(--e2);
	}
	a {
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 1px;
		border-radius: var(--r-pill);
		color: var(--ink-3);
		font-size: 12px;
		font-weight: 800;
		text-decoration: none;
		transition:
			background var(--t-ui) var(--ease),
			color var(--t-ui) var(--ease);
	}
	a[aria-current='page'] {
		background: var(--sun-soft);
		color: #a0102f;
	}
	@media (min-width: 768px) {
		.bottom {
			display: none;
		}
	}
</style>
