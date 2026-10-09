<script>
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import PointDots from '$lib/components/ui/PointDots.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import { VOTE_BUDGET } from '$lib/config/voting.js';

	/**
	 * A member's profile: their photo enlarged, and what they've voted for.
	 * @type {{
	 *   person: import('./types.js').PersonRowData,
	 *   isMe: boolean,
	 *   open: boolean,
	 *   onclose: () => void
	 * }}
	 */
	let { person, isMe, open, onclose } = $props();

	const budget = $derived(person.member.votes ?? VOTE_BUDGET);
	/** Show the nickname only when it isn't just their first name. */
	const aka = $derived(
		person.member.short && !person.member.name.startsWith(person.member.short)
			? person.member.short
			: ''
	);
</script>

<Sheet {open} title={person.member.name} {onclose}>
	<div class="profile">
		<Avatar member={person.member} size={200} ring />
		<p class="line">
			{#if isMe}<span class="you">That's you</span>{/if}
			{#if aka}<span class="aka">Known as <b>{aka}</b></span>{/if}
		</p>
		<p class="spent num">
			{#if person.spent === 0}
				Hasn't voted yet
			{:else}
				{person.spent} of {budget} points given
			{/if}
		</p>
		{#if person.picks.length}
			<ul class="picks" aria-label="Votes by {person.member.short}">
				{#each person.picks as pick (pick.villa.id)}
					<li>
						<span>{pick.villa.name}</span>
						<PointDots value={pick.points} size={10} />
						<span class="sr-only">{pick.points} point{pick.points === 1 ? '' : 's'}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</Sheet>

<style>
	.profile {
		display: grid;
		justify-items: center;
		gap: var(--s3);
		text-align: center;
		min-width: min(300px, 70vw);
	}
	.profile p {
		margin: 0;
	}
	.line {
		display: flex;
		gap: var(--s3);
		flex-wrap: wrap;
		justify-content: center;
		color: var(--ink-2);
		font-weight: 700;
	}
	.you {
		color: var(--hibiscus);
		font-weight: 900;
	}
	.spent {
		font-weight: 800;
	}
	.picks {
		display: grid;
		gap: 6px;
		justify-items: center;
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
		font-weight: 800;
		font-size: 14px;
	}
</style>
