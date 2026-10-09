<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { adminEnhance } from '$lib/admin-form.js';
	import AppBar from '$lib/components/ui/AppBar.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import ConfirmSheet from '$lib/components/ui/ConfirmSheet.svelte';
	import Countdown from '$lib/components/ui/Countdown.svelte';
	import { villas } from '$lib/config/villas.js';
	import { formatDeadline } from '$lib/time.js';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const villaById = new Map(villas.map((v) => [v.id, v]));
	const memberById = $derived(new Map(data.members.map((m) => [m.id, m])));

	/**
	 * Which confirmation is open (one at a time).
	 * @type {{ kind: 'close' | 'reset' | 'winner' | 'remove' | 'undo', villaId?: string } | null}
	 */
	let confirming = $state(null);
	const closeSheet = () => (confirming = null);
	const submit = adminEnhance(closeSheet);

	const decided = $derived(data.state === 'decided');
	const open = $derived(data.state === 'open');
	const winner = $derived(data.winnerId ? villaById.get(data.winnerId) : undefined);
	const notVoted = $derived(data.results.notVotedYet.flatMap((id) => memberById.get(id) ?? []));
	const removedVillas = $derived(data.removed.flatMap((id) => villaById.get(id) ?? []));
	const totalVotes = $derived(data.results.byVilla.reduce((sum, r) => sum + r.total, 0));

	/** The villa the open confirmation is about, with who would get points back. */
	const target = $derived.by(() => {
		const id = confirming?.villaId;
		if (!id) return null;
		const villa = villaById.get(id);
		const row = data.results.byVilla.find((r) => r.villaId === id);
		if (!villa) return null;
		const voters = (row?.voters ?? []).flatMap((v) => {
			const member = memberById.get(v.memberId);
			return member ? [{ name: member.short, points: v.points }] : [];
		});
		return { villa, voters, total: row?.total ?? 0 };
	});
</script>

<svelte:head>
	<title>Admin · Eurotrip</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<AppBar member={data.member} nav={[{ href: '/vote', label: 'Villas' }]} current="/admin" />

<main class="page stack admin">
	<header>
		<p class="t-overline">Admin</p>
		<h1 class="t-title">Run the vote</h1>
		<p class="muted">
			Only you can see this page. Everything here is visible to the group once done.
		</p>
	</header>

	<!-- Voting window -->
	<Card>
		<section class="stack" aria-labelledby="h-window">
			<div class="head">
				<h2 id="h-window" class="t-headline">Voting window</h2>
				{#if decided}
					<Chip tone="sun" icon="trophy">Winner picked</Chip>
				{:else if open}
					<Chip tone="success" icon="check">Open</Chip>
				{:else}
					<Chip tone="danger" icon="lock">Closed</Chip>
				{/if}
			</div>

			<p class="line">
				<Countdown deadline={data.deadline} closedLabel="Closed" />
				<span>{open ? 'Closes' : 'Closed'} {formatDeadline(data.deadline)}</span>
			</p>

			{#if decided}
				<p>
					The group is going to <b>{winner?.name ?? 'the winning villa'}</b>. To change the
					deadline, reset votes or remove villas, undo the winner first.
				</p>
				<div>
					<Button variant="secondary" onclick={() => (confirming = { kind: 'undo' })}>
						Undo winner
					</Button>
				</div>
			{:else}
				<form class="deadline" method="POST" action="?/extend" use:enhance={submit}>
					<label class="field-label" for="deadline">
						{open ? 'Change the closing time' : 'Reopen until'}
						<span class="muted">(Pacific time)</span>
					</label>
					<div class="row wrap">
						<input
							class="field"
							id="deadline"
							name="deadline"
							type="datetime-local"
							value={data.deadlineInput}
							required
						/>
						<Button type="submit">{open ? 'Update deadline' : 'Reopen voting'}</Button>
					</div>
				</form>
				{#if open}
					<div>
						<Button variant="secondary" onclick={() => (confirming = { kind: 'close' })}>
							Close voting now
						</Button>
					</div>
				{/if}
			{/if}
		</section>
	</Card>

	<!-- Results -->
	<Card>
		<section class="stack" aria-labelledby="h-results">
			<div class="head">
				<h2 id="h-results" class="t-headline">Results</h2>
				<span class="muted num">{totalVotes} point{totalVotes === 1 ? '' : 's'} given</span>
			</div>
			<ul class="results">
				{#each data.results.byVilla as r (r.villaId)}
					{@const villa = villaById.get(r.villaId)}
					{#if villa}
						<li class:winner={r.villaId === data.winnerId}>
							<span class="rank num">{r.rank ?? '–'}</span>
							{#if villa.photos[0]}
								<img src={villa.photos[0].thumb} alt="" width="64" height="48" loading="lazy" />
							{/if}
							<div class="who">
								<p class="vname">
									{villa.name}
									{#if r.villaId === data.winnerId}<Chip tone="sun" icon="trophy">Winner</Chip>{/if}
								</p>
								<p class="vmeta">
									{villa.town} ·
									<b class="num">{r.total} pt{r.total === 1 ? '' : 's'}</b>
								</p>
								{#if r.voters.length}
									<ul class="voters" aria-label="Votes for {villa.name}">
										{#each r.voters as v (v.memberId)}
											{@const member = memberById.get(v.memberId)}
											{#if member}
												<li title="{member.short}: {v.points}">
													<Avatar {member} size={26} ring />
													<span class="pts num" aria-hidden="true">{v.points}</span>
													<span class="sr-only">{member.short}, {v.points} points</span>
												</li>
											{/if}
										{/each}
									</ul>
								{/if}
							</div>
							{#if !decided}
								<div class="acts">
									<Button
										size="sm"
										onclick={() => (confirming = { kind: 'winner', villaId: r.villaId })}
									>
										Pick winner
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onclick={() => (confirming = { kind: 'remove', villaId: r.villaId })}
									>
										Remove
									</Button>
								</div>
							{/if}
						</li>
					{/if}
				{/each}
			</ul>

			{#if notVoted.length}
				<p class="note">
					<b>Haven't voted yet:</b>
					{notVoted.map((m) => m.short).join(', ')}.
				</p>
			{/if}
		</section>
	</Card>

	<!-- Removed villas -->
	{#if removedVillas.length}
		<Card>
			<section class="stack" aria-labelledby="h-removed">
				<h2 id="h-removed" class="t-headline">Removed villas</h2>
				<p class="muted">
					These are hidden from everyone. Bringing one back starts it at zero votes; the points that
					were returned stay with their owners.
				</p>
				<ul class="removed">
					{#each removedVillas as villa (villa.id)}
						<li>
							<span>{villa.name} <span class="muted">· {villa.town}</span></span>
							{#if !decided}
								<form method="POST" action="?/restoreVilla" use:enhance={submit}>
									<input type="hidden" name="villaId" value={villa.id} />
									<Button type="submit" variant="secondary" size="sm">Bring back</Button>
								</form>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		</Card>
	{/if}

	<!-- Reset everyone's votes -->
	<Card>
		<section class="stack" aria-labelledby="h-reset">
			<h2 id="h-reset" class="t-headline">Start the vote over</h2>
			<p>
				Give <b>everyone</b> all their points back and clear every vote, so the group can vote again from
				scratch. Members see a message telling them what happened.
			</p>
			<div>
				<Button
					variant="danger"
					disabled={decided}
					onclick={() => (confirming = { kind: 'reset' })}
				>
					Reset everyone's votes
				</Button>
			</div>
			{#if decided}<p class="muted">Undo the winner first.</p>{/if}
		</section>
	</Card>

	<!-- Profile photos -->
	<Card>
		<section class="stack" aria-labelledby="h-photos">
			<h2 id="h-photos" class="t-headline">Profile photos</h2>
			<p class="muted">
				Everyone starts on their own photo. When someone presses "Change photo" they move on to the
				next prepared one. Here you can put someone back on their own; their votes aren't touched.
			</p>
			<ul class="photos">
				{#each data.members as m (m.id)}
					{@const total = data.photoCounts[m.id] ?? 0}
					<li>
						<Avatar member={m} size={36} />
						<span class="pname">{m.name}</span>
						<span class="muted num">
							{total ? `photo ${m.photo ?? 1} of ${total}` : 'no photos'}
						</span>
						{#if (m.photo ?? 0) > 1}
							<form method="POST" action="?/resetPhoto" use:enhance={submit}>
								<input type="hidden" name="memberId" value={m.id} />
								<Button type="submit" variant="secondary" size="sm">Back to own photo</Button>
							</form>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	</Card>

	<!-- Security -->
	<Card>
		<section class="stack" aria-labelledby="h-sec">
			<h2 id="h-sec" class="t-headline">Login security</h2>
			<p class="line">
				<Chip tone={data.stats.failures24h > 10 ? 'danger' : 'neutral'} icon="shield">
					{data.stats.failures24h} failed login{data.stats.failures24h === 1 ? '' : 's'} in 24 h
				</Chip>
				{#if data.stats.pausedFor > 0}
					<Chip tone="danger" icon="alert"
						>New logins paused for {Math.ceil(data.stats.pausedFor / 60)} min</Chip
					>
				{:else}
					<Chip tone="success" icon="check">No login pause</Chip>
				{/if}
			</p>
			<p class="muted">
				Wrong guesses are limited per device and overall. A pause means many wrong phrases came in
				within an hour; people already signed in are not affected.
			</p>
		</section>
	</Card>

	<p><a class="back" href={resolve('/vote')}>← Back to the vote</a></p>
</main>

<!-- Confirmations: every one-way action asks first -->
<ConfirmSheet
	open={confirming?.kind === 'close'}
	title="Close voting now?"
	action="?/closeNow"
	confirmLabel="Close voting"
	{submit}
	onclose={closeSheet}
>
	<p>Nobody will be able to change their votes. You can reopen voting later with a new time.</p>
</ConfirmSheet>

<ConfirmSheet
	open={confirming?.kind === 'reset'}
	title="Reset everyone's votes?"
	action="?/resetAll"
	confirmLabel="Reset everyone's votes"
	tone="danger"
	{submit}
	onclose={closeSheet}
>
	<p>
		All {totalVotes} point{totalVotes === 1 ? '' : 's'} given so far will be cleared and every member
		gets their full budget back.
	</p>
	<p>This can't be undone, though everyone can vote again right away.</p>
</ConfirmSheet>

<ConfirmSheet
	open={confirming?.kind === 'winner'}
	title="Pick {target?.villa.name ?? 'this villa'}?"
	action="?/pickWinner"
	fields={{ villaId: confirming?.villaId ?? '' }}
	confirmLabel="Pick as winner"
	{submit}
	onclose={closeSheet}
>
	<p>
		<b>{target?.villa.name}</b> becomes the trip villa and voting ends for everyone
		{#if open}(even though the deadline hasn't passed){/if}. You can undo this.
	</p>
</ConfirmSheet>

<ConfirmSheet
	open={confirming?.kind === 'remove'}
	title="Remove {target?.villa.name ?? 'this villa'}?"
	action="?/removeVilla"
	fields={{ villaId: confirming?.villaId ?? '' }}
	confirmLabel="Remove villa"
	tone="danger"
	{submit}
	onclose={closeSheet}
>
	<p>It disappears from the map and the list for everyone.</p>
	{#if target?.voters.length}
		<p>
			The <b>{target.total} point{target.total === 1 ? '' : 's'}</b> given to it go back to
			{target.voters.map((v) => `${v.name} (${v.points})`).join(', ')}, who can vote again.
		</p>
	{:else}
		<p>Nobody has voted for it yet.</p>
	{/if}
</ConfirmSheet>

<ConfirmSheet
	open={confirming?.kind === 'undo'}
	title="Undo the winner?"
	action="?/undoWinner"
	confirmLabel="Undo winner"
	{submit}
	onclose={closeSheet}
>
	<p>
		{winner?.name ?? 'The villa'} is no longer the winner. Voting returns to its deadline ({formatDeadline(
			data.deadline
		)}), so it may be closed or open.
	</p>
</ConfirmSheet>

<style>
	.admin {
		max-width: 860px;
	}
	.muted {
		color: var(--ink-3);
		font-weight: 600;
		margin: 0;
	}
	h1,
	h2 {
		margin: 0;
	}
	h2 {
		color: var(--lagoon-deep);
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s3);
		flex-wrap: wrap;
	}
	.line {
		display: flex;
		align-items: center;
		gap: var(--s3);
		flex-wrap: wrap;
		margin: 0;
		font-weight: 700;
	}
	.field-label {
		display: block;
		margin-bottom: var(--s2);
		font-weight: 800;
	}
	.row.wrap {
		flex-wrap: wrap;
	}
	.row .field {
		width: auto;
		min-width: 220px;
	}

	.results {
		display: grid;
		gap: var(--s3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.results > li {
		display: grid;
		grid-template-columns: 28px 64px 1fr;
		gap: var(--s3);
		align-items: start;
		padding: var(--s3);
		border: 2px solid var(--line);
		border-radius: var(--r-md);
	}
	.results > li.winner {
		border-color: var(--mango);
		background: var(--sun-soft);
	}
	.rank {
		font-weight: 900;
		font-size: 18px;
		color: var(--ink-2);
		text-align: center;
		padding-top: 2px;
	}
	.results img {
		width: 64px;
		height: 48px;
		object-fit: cover;
		border-radius: var(--r-sm);
	}
	.who {
		min-width: 0;
	}
	.vname,
	.vmeta {
		margin: 0;
	}
	.vname {
		font-weight: 900;
		display: flex;
		align-items: center;
		gap: var(--s2);
		flex-wrap: wrap;
	}
	.vmeta {
		color: var(--ink-2);
		font-size: 14px;
		font-weight: 700;
	}
	.voters {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: var(--s2) 0 0;
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
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: var(--mango);
		font-size: 10px;
		font-weight: 900;
	}
	.acts {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		gap: var(--s2);
		justify-content: flex-end;
	}
	@media (min-width: 640px) {
		.results > li {
			grid-template-columns: 28px 64px 1fr auto;
		}
		.acts {
			grid-column: auto;
			flex-direction: column;
			justify-content: flex-start;
		}
	}
	.note {
		margin: 0;
		padding: var(--s3) var(--s4);
		border-radius: var(--r-md);
		background: var(--sun-soft);
	}
	.photos {
		display: grid;
		gap: var(--s3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.photos li {
		display: flex;
		align-items: center;
		gap: var(--s3);
		flex-wrap: wrap;
	}
	.pname {
		font-weight: 800;
		flex: 1 1 140px;
	}
	.removed {
		display: grid;
		gap: var(--s2);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.removed li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s3);
		flex-wrap: wrap;
		font-weight: 800;
	}
	.back {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--lagoon-deep);
		font-weight: 800;
	}
</style>
