<script>
	import Button from '$lib/components/ui/Button.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Icon from '$lib/icons/Icon.svelte';

	/**
	 * "Start over": take all my points back, after a confirmation. One component
	 * for every screen, so the way to start over is always in the same place.
	 * `bar` = compact pill for the top bar; otherwise a normal text button.
	 * @type {{ budget: number, onreset: () => void, bar?: boolean }}
	 */
	let { budget, onreset, bar = false } = $props();

	let confirming = $state(false);
</script>

{#if bar}
	<button
		type="button"
		class="start-over"
		aria-label="Start over: reset all my votes"
		title="Start over"
		onclick={() => (confirming = true)}
	>
		<Icon name="rotate-ccw" size={18} />
		<span class="label">Start over</span>
	</button>
{:else}
	<Button variant="ghost" onclick={() => (confirming = true)}>
		<Icon name="rotate-ccw" size={16} /> Start over
	</Button>
{/if}

<Sheet open={confirming} title="Reset all your votes?" onclose={() => (confirming = false)}>
	<div class="confirm">
		<p>
			You'll get all {budget} points back and can vote again. Everyone can see your votes, so they will
			see yours disappear until you vote again.
		</p>
		<div class="actions">
			<Button variant="secondary" onclick={() => (confirming = false)}>Keep my votes</Button>
			<Button
				variant="danger"
				onclick={() => {
					confirming = false;
					onreset();
				}}>Reset my votes</Button
			>
		</div>
	</div>
</Sheet>

<style>
	.start-over {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-width: 44px;
		min-height: 44px;
		padding: 0 10px;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink-2);
		font-weight: 800;
		font-size: 14px;
		cursor: pointer;
	}
	.start-over:hover {
		background: var(--surface-2);
		color: var(--hibiscus);
	}
	/* The label only where there's room; the icon is enough on phones. */
	@media (max-width: 640px) {
		.label {
			display: none;
		}
	}
	.confirm {
		display: grid;
		gap: var(--s4);
	}
	.confirm p {
		margin: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s3);
		justify-content: flex-end;
	}
</style>
