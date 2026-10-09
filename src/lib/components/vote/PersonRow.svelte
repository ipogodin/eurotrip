<script>
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import PointDots from '$lib/components/ui/PointDots.svelte';
	import { VOTE_BUDGET } from '$lib/config/voting.js';
	import { nameFor } from '$lib/members-ui.js';
	import PersonProfile from './PersonProfile.svelte';

	/** @type {{ person: import('./types.js').PersonRowData, isMe: boolean }} */
	let { person, isMe } = $props();

	let profileOpen = $state(false);
</script>

<li class="person" class:me={isMe}>
	<div class="who">
		<!-- Click or tap to see the photo enlarged with their profile; a computer also gets a quick hover preview. -->
		<button
			type="button"
			class="face"
			aria-label="See {person.member.name}'s profile"
			onclick={() => (profileOpen = true)}
		>
			<Avatar member={person.member} size={40} ring />
			<span class="zoom" aria-hidden="true"><Avatar member={person.member} size={140} ring /></span>
		</button>
		<div>
			<p class="name">
				{isMe ? nameFor(person.member) : person.member.name}
				{#if isMe}<span class="you">(you)</span>{/if}
			</p>
			<p class="spent num">
				{#if person.spent === 0}
					Not voted yet
				{:else}
					{person.spent} of {person.member.votes ?? VOTE_BUDGET} points
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

<PersonProfile {person} {isMe} open={profileOpen} onclose={() => (profileOpen = false)} />

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
	.face {
		position: relative;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		cursor: zoom-in;
	}
	.zoom {
		position: absolute;
		left: -6px;
		top: -6px;
		z-index: 20;
		display: none;
		pointer-events: none;
		filter: drop-shadow(0 10px 18px rgb(60 20 40 / 0.35));
	}
	/* A bigger look on hover/keyboard focus, only where there is a real pointer. */
	@media (hover: hover) {
		.face:hover .zoom,
		.face:focus-visible .zoom {
			display: block;
			animation: pop var(--t-ui) var(--spring);
		}
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(0.6);
		}
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
