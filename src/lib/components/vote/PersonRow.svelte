<script>
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import PointDots from '$lib/components/ui/PointDots.svelte';
	import { VOTE_BUDGET } from '$lib/config/voting.js';

	/** @type {{ person: import('./types.js').PersonRowData, isMe: boolean }} */
	let { person, isMe } = $props();
</script>

<li class="person" class:me={isMe}>
	<div class="who">
		<Avatar member={person.member} size={40} ring />
		<div>
			<p class="name">
				{person.member.name}
				{#if isMe}<span class="you">(you)</span>{/if}
			</p>
			<p class="spent num">
				{#if person.spent === 0}
					Not voted yet
				{:else}
					{person.spent} of {VOTE_BUDGET} points
				{/if}
			</p>
		</div>
	</div>
	{#if person.picks.length}
		<ul class="picks">
			{#each person.picks as pick (pick.villa.id)}
				<li>
					<span class="villa">{pick.villa.name}</span>
					<PointDots value={pick.points} size={10} />
					<span class="sr-only">{pick.points} point{pick.points === 1 ? '' : 's'}</span>
				</li>
			{/each}
		</ul>
	{/if}
</li>

<style>
	.person {
		display: grid;
		gap: var(--s3);
		padding: var(--s4);
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--r-md);
	}
	.person.me {
		border-color: var(--hibiscus);
	}
	.who {
		display: flex;
		align-items: center;
		gap: var(--s3);
	}
	.name,
	.spent {
		margin: 0;
	}
	.name {
		font-weight: 900;
	}
	.you {
		color: var(--hibiscus);
	}
	.spent {
		color: var(--ink-2);
		font-size: 14px;
		font-weight: 700;
	}
	.picks {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.picks li {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 4px 12px;
		border-radius: var(--r-pill);
		background: var(--surface-2);
		font-size: 14px;
		font-weight: 800;
	}
</style>
