<script>
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';

	/**
	 * Who voted for this villa, and my +/- buttons. Sits directly under the
	 * photo so nobody has to hunt for the vote control.
	 * @type {{
	 *   name: string,
	 *   voters: { member: import('$lib/members-ui.js').PublicMember, points: number }[],
	 *   total: number,
	 *   myPoints: number,
	 *   canAdd: boolean,
	 *   addHint: string,
	 *   open: boolean,
	 *   onchange: (points: number) => void
	 * }}
	 */
	let { name, voters, total, myPoints, canAdd, addHint, open, onchange } = $props();
</script>

<div class="votebar">
	<div class="votes">
		{#if voters.length}
			<ul class="voters" aria-label="Votes for {name}">
				{#each voters as v (v.member.id)}
					<li title="{v.member.short}: {v.points} pt{v.points === 1 ? '' : 's'}">
						<Avatar member={v.member} size={28} ring />
						<span class="pts num" aria-hidden="true">{v.points}</span>
						<span class="sr-only"
							>{v.member.short}, {v.points} point{v.points === 1 ? '' : 's'}</span
						>
					</li>
				{/each}
			</ul>
			<span class="total num">{total} pt{total === 1 ? '' : 's'}</span>
		{:else}
			<span class="none">No votes yet</span>
		{/if}
	</div>
	{#if open}
		<Stepper value={myPoints} {canAdd} label={name} {addHint} {onchange} />
	{:else if myPoints}
		<span class="my num">You gave {myPoints}</span>
	{/if}
</div>

<style>
	.votebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s3);
		padding: var(--s3) var(--s4);
		background: var(--surface);
		border-bottom: 2px dashed var(--line);
	}
	.votes {
		display: flex;
		align-items: center;
		gap: var(--s2);
		min-width: 0;
	}
	.voters {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.voters li {
		position: relative;
	}
	.pts {
		position: absolute;
		right: -4px;
		bottom: -4px;
		display: grid;
		place-items: center;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--mango);
		color: var(--ink);
		font-size: 10px;
		font-weight: 900;
	}
	.total {
		font-weight: 900;
		white-space: nowrap;
	}
	.none {
		color: var(--ink-3);
		font-size: 14px;
		font-weight: 700;
	}
	.my {
		font-weight: 800;
		color: var(--hibiscus);
	}
</style>
