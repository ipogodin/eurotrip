<script>
	import AvatarStack from '$lib/components/ui/AvatarStack.svelte';
	import { nameFor } from '$lib/members-ui.js';

	/** @type {{ members: import('$lib/members-ui.js').PublicMember[] }} */
	let { members } = $props();

	const names = $derived(members.map((m) => nameFor(m)));
	const list = $derived(
		names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
	);
</script>

{#if members.length}
	<div class="nudge" role="note">
		<AvatarStack {members} max={5} />
		<p>
			<b>Still deciding:</b>
			{list}.
		</p>
	</div>
{/if}

<style>
	.nudge {
		display: flex;
		align-items: center;
		gap: var(--s3);
		padding: var(--s3) var(--s4);
		border-radius: var(--r-md);
		background: var(--sun-soft);
	}
	p {
		margin: 0;
		font-weight: 700;
	}
</style>
