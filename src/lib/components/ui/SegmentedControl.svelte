<script>
	import Icon from '$lib/icons/Icon.svelte';

	/**
	 * @type {{
	 *   options: { value: string, label: string, icon?: import('$lib/icons/paths.js').IconName }[],
	 *   value: string,
	 *   label: string,
	 *   onchange: (value: string) => void
	 * }}
	 */
	let { options, value, label, onchange } = $props();
</script>

<div class="seg" role="group" aria-label={label}>
	{#each options as o (o.value)}
		<button
			type="button"
			class:active={o.value === value}
			aria-pressed={o.value === value}
			onclick={() => onchange(o.value)}
		>
			{#if o.icon}<Icon name={o.icon} size={16} />{/if}
			{o.label}
		</button>
	{/each}
</div>

<style>
	.seg {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 2px;
		padding: 3px;
		background: var(--surface-2);
		border-radius: var(--r-md);
	}
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-height: 38px;
		padding: 0 var(--s4);
		border: 0;
		border-radius: calc(var(--r-md) - 3px);
		background: transparent;
		color: var(--ink-2);
		font-size: 14px;
		font-weight: 600;
		white-space: nowrap;
		transition:
			background var(--t-ui) var(--ease),
			color var(--t-ui) var(--ease);
	}
	button.active {
		background: var(--surface);
		color: var(--ink);
		box-shadow: var(--e1);
	}
</style>
