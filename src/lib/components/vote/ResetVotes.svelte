<script>
	import Button from '$lib/components/ui/Button.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';

	/**
	 * "Reset my votes": take all my points back, after a confirmation. One
	 * component for every screen, so it's always worded and placed the same.
	 * Plain words on purpose (no refresh-style icon, which reads as "reload").
	 * `bar` = compact outlined pill for the top bar; otherwise a normal button.
	 * @type {{ budget: number, onreset: () => void, bar?: boolean }}
	 */
	let { budget, onreset, bar = false } = $props();

	let confirming = $state(false);
</script>

{#if bar}
	<button
		type="button"
		class="reset-btn"
		aria-label="Reset all my votes"
		onclick={() => (confirming = true)}
	>
		<span class="short">Reset</span><span class="long">Reset my votes</span>
	</button>
{:else}
	<Button variant="ghost" onclick={() => (confirming = true)}>Reset my votes</Button>
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
	.reset-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0 10px;
		border: 2px solid var(--line);
		border-radius: var(--r-pill);
		background: var(--surface);
		color: var(--ink);
		font-weight: 800;
		font-size: 14px;
		cursor: pointer;
		transition:
			border-color var(--t-ui) ease,
			color var(--t-ui) ease;
	}
	.reset-btn:hover {
		border-color: var(--hibiscus);
		color: var(--hibiscus);
	}
	/* "Reset" on phones; the full words where there's room. */
	.long {
		display: none;
	}
	@media (min-width: 641px) {
		.short {
			display: none;
		}
		.long {
			display: inline;
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
