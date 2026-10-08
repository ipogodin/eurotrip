<script>
	import Icon from '$lib/icons/Icon.svelte';

	/**
	 * @type {{
	 *   tone?: 'neutral' | 'accent' | 'sun' | 'danger' | 'success',
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
		min-height: 26px;
		padding: 0 10px;
		border-radius: var(--r-pill);
		font-size: 13px;
		font-weight: 500;
		line-height: 1;
		background: var(--surface-2);
		color: var(--ink-2);
		white-space: nowrap;
	}
	.accent {
		background: var(--accent-soft);
		color: var(--accent-strong);
	}
	.sun {
		background: var(--sun-soft);
		color: #7a5400;
	}
	.danger {
		background: var(--danger-soft);
		color: #a82f2f;
	}
	.success {
		background: var(--success-soft);
		color: #17684a;
	}
</style>
