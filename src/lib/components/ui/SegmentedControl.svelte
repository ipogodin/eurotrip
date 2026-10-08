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
		gap: 3px;
		padding: 4px;
		background: var(--surface-2);
		border-radius: var(--r-pill);
	}
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-height: 42px;
		padding: 0 var(--s5);
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink-2);
		font-size: 15px;
		font-weight: 800;
		white-space: nowrap;
		transition:
			background var(--t-ui) var(--ease),
			color var(--t-ui) var(--ease),
			transform var(--t-ui) var(--spring);
	}
	button:hover:not(.active) {
		color: var(--ink);
	}
	button.active {
		background: var(--lagoon-deep);
		color: #fff;
		box-shadow: 0 4px 12px rgb(6 122 128 / 0.35);
	}
</style>
