<script>
	/** @type {{ padded?: boolean, children: import('svelte').Snippet }} */
	let { padded = true, children, ...rest } = $props();
</script>

<div class="card" class:padded {...rest}>
	{@render children()}
</div>

<style>
	.card {
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--r-lg);
		box-shadow: var(--e1);
		overflow: hidden;
	}
	.padded {
		padding: var(--s5);
	}
</style>
