<script>
	import Icon from '$lib/icons/Icon.svelte';

	/**
	 * @type {{
	 *   tone?: 'neutral' | 'accent' | 'sea' | 'sun' | 'danger' | 'success',
	 *   icon?: import('$lib/icons/paths.js').IconName,
	 *   children: import('svelte').Snippet
	 * }}
	 */
	let { tone = 'neutral', icon, children } = $props();
</script>

<span class="chip {tone}">
	{#if icon}<Icon name={icon} size={14} />{/if}
	{@render children()}
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		min-height: 28px;
		padding: 0 12px;
		border-radius: var(--r-pill);
		font-size: 13px;
		font-weight: 800;
		line-height: 1;
		background: var(--surface-2);
		color: var(--ink-2);
		white-space: nowrap;
	}
	.accent {
		background: var(--accent-soft);
		color: #a0102f;
	}
	.sea {
		background: var(--sea-soft);
		color: #055c61;
	}
	.sun {
		background: var(--sun-soft);
		color: #7a3e00;
	}
	.danger {
		background: var(--danger-soft);
		color: #a32013;
	}
	.success {
		background: var(--success-soft);
		color: #0b5f3b;
	}
</style>
