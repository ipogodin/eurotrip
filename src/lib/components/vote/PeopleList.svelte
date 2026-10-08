<script>
	import NotVotedNudge from './NotVotedNudge.svelte';
	import PersonRow from './PersonRow.svelte';

	/**
	 * @type {{
	 *   people: import('./types.js').PersonRowData[],
	 *   notVoted: import('$lib/members-ui.js').PublicMember[],
	 *   me: string
	 * }}
	 */
	let { people, notVoted, me } = $props();
</script>

<div class="stack">
	<NotVotedNudge members={notVoted} />
	<ul class="people">
		{#each people as person (person.member.id)}
			<PersonRow {person} isMe={person.member.id === me} />
		{/each}
	</ul>
</div>

<style>
	.people {
		display: grid;
		gap: var(--s3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	@media (min-width: 900px) {
		.people {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
