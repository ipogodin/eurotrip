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
		inset: auto 0 0 0;
		height: calc(var(--bottomnav-h) + env(safe-area-inset-bottom));
		padding-bottom: env(safe-area-inset-bottom);
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		background: rgb(255 255 255 / 0.92);
		backdrop-filter: blur(14px);
		border-top: 1px solid var(--line);
	}
	a {
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 2px;
		color: var(--ink-3);
		font-size: 12px;
		font-weight: 600;
		text-decoration: none;
	}
	a[aria-current='page'] {
		color: var(--accent);
	}
	@media (min-width: 768px) {
		.bottom {
			display: none;
		}
	}
</style>
