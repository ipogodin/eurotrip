<script>
	import Avatar from './Avatar.svelte';

	/** @type {{ members: import('$lib/members-ui.js').PublicMember[], max?: number, size?: number }} */
	let { members, max = 4, size = 28 } = $props();

	const shown = $derived(members.slice(0, max));
	const extra = $derived(Math.max(0, members.length - max));
</script>

<span class="stack" style:--size="{size}px">
	{#each shown as m (m.id)}
		<span class="item"><Avatar member={m} {size} ring /></span>
	{/each}
	{#if extra > 0}
		<span class="more" aria-label="and {extra} more">+{extra}</span>
	{/if}
</span>

<style>
	.stack {
		display: inline-flex;
		align-items: center;
	}
	.item + .item,
	.item + .more {
		margin-left: -6px;
	}
	.more {
		margin-left: -6px;
		display: inline-grid;
		place-items: center;
		min-width: var(--size);
		height: var(--size);
		padding: 0 8px;
		border-radius: var(--r-pill);
		background: var(--sun-soft);
		color: #7a3e00;
		font-size: 12px;
		font-weight: 900;
		box-shadow: 0 0 0 3px #fff;
	}
</style>
