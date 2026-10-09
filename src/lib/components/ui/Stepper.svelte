<script>
	import { MAX_PER_VILLA } from '$lib/config/voting.js';
	import Icon from '$lib/icons/Icon.svelte';
	import PointDots from './PointDots.svelte';

	/**
	 * @type {{
	 *   value: number,
	 *   max?: number,
	 *   canAdd: boolean,
	 *   label: string,
	 *   disabled?: boolean,
	 *   addHint?: string,
	 *   onchange: (next: number) => void
	 * }}
	 */
	let {
		value,
		max = MAX_PER_VILLA,
		canAdd,
		label,
		disabled = false,
		addHint = '',
		onchange
	} = $props();

	const canIncrement = $derived(!disabled && canAdd && value < max);
	const canDecrement = $derived(!disabled && value > 0);
</script>

<div class="stepper" role="group" aria-label="Points for {label}">
	<button
		type="button"
		class="step"
		disabled={!canDecrement}
		aria-label="Remove a point from {label}"
		onclick={() => onchange(value - 1)}
	>
		<Icon name="minus" size={18} />
	</button>
	<span class="mid" aria-live="polite">
		<PointDots {value} {max} size={11} />
		<span class="sr-only">{value} of {max} points</span>
	</span>
	<button
		type="button"
		class="step add"
		disabled={!canIncrement}
		aria-label="Add a point to {label}"
		title={!canIncrement && !disabled && value < max ? addHint : undefined}
		onclick={() => onchange(value + 1)}
	>
		<Icon name="plus" size={18} />
	</button>
</div>

<style>
	.stepper {
		display: inline-flex;
		align-items: center;
		gap: var(--s2);
	}
	.step {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 2px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		transition:
			transform var(--t-ui) var(--spring),
			background var(--t-ui) var(--ease);
	}
	.step:hover:not(:disabled) {
		background: var(--surface-2);
		transform: scale(1.08);
	}
	.step:active:not(:disabled) {
		transform: scale(0.9);
	}
	.add:not(:disabled) {
		background: var(--grad-cta);
		border-color: transparent;
		color: var(--accent-ink);
		box-shadow: var(--glow-cta);
	}
	.add:hover:not(:disabled) {
		background: var(--grad-cta);
	}
	.step:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.mid {
		min-width: 60px;
		display: grid;
		place-items: center;
	}
</style>
