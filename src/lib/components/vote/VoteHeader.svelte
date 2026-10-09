<script>
	import Countdown from '$lib/components/ui/Countdown.svelte';
	import Frond from '$lib/components/ui/Frond.svelte';
	import PointsMeter from '$lib/components/ui/PointsMeter.svelte';
	import Sun from '$lib/components/ui/Sun.svelte';
	import Wave from '$lib/components/ui/Wave.svelte';
	import { MAX_PER_VILLA } from '$lib/config/voting.js';
	import { formatDeadline } from '$lib/time.js';

	/**
	 * @type {{
	 *   name: string,
	 *   deadline: string,
	 *   state: import('$lib/voting.js').VotingState,
	 *   winnerName: string | null,
	 *   mySpent: number,
	 *   budget: number,
	 *   compact?: boolean
	 * }}
	 */
	let { name, deadline, state, winnerName, mySpent, budget, compact = false } = $props();

	const left = $derived(Math.max(0, budget - mySpent));
</script>

<section class="hero" class:compact>
	{#if !compact}
		<div class="frond left" aria-hidden="true"><Frond size={260} rotate={-10} /></div>
		<div class="frond right" aria-hidden="true"><Frond size={300} flip rotate={8} /></div>
	{/if}
	<div class="sunwrap" aria-hidden="true"><Sun size={130} /></div>

	<div class="inner">
		{#if state === 'decided'}
			<span class="t-script tag">¡Nos vamos!</span>
			<h1 class="t-display">We're staying at <em>{winnerName}</em></h1>
			<p class="lede">Voting is over. Tap the photo to see our villa.</p>
		{:else}
			{#if !compact}<span class="t-script tag">¡Hola, {name}!</span>{/if}
			<h1 class="t-display" class:small={compact}>Where are we <em>sleeping</em>?</h1>
			{#if state === 'open' && !compact}
				<p class="lede">
					{budget} points to spend, up to {MAX_PER_VILLA} per villa. Votes save as you tap, and everyone
					can see them.
				</p>
			{/if}
			<div class="status">
				<Countdown {deadline} closedLabel="Voting closed" />
				<span class="when">
					{state === 'open' ? 'Closes' : 'Closed'}
					{formatDeadline(deadline)}
				</span>
			</div>
			{#if state === 'open' && !compact}
				<div class="meter">
					<PointsMeter spent={mySpent} {budget} />
					<p class="left" aria-live="polite">
						{#if left === 0}
							All {budget} points used. Take one back to move it.
						{:else if mySpent === 0}
							You haven't voted yet.
						{:else}
							{left} point{left === 1 ? '' : 's'} left
						{/if}
					</p>
				</div>
			{:else if state !== 'open'}
				<p class="closed">Voting has closed. The admin will pick the villa soon.</p>
			{/if}
		{/if}
	</div>
	<div class="wave" aria-hidden="true"><Wave height={40} /></div>
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden;
		background: var(--grad-sunset);
		color: #fff;
		text-align: center;
		padding-top: var(--s7);
	}
	.inner {
		position: relative;
		z-index: 2;
		display: grid;
		justify-items: center;
		gap: var(--s3);
		max-width: 640px;
		margin-inline: auto;
		padding: 0 var(--s4) var(--s6);
	}
	h1 {
		margin: 0;
		text-shadow: 0 2px 20px rgb(91 42 134 / 0.35);
	}
	h1 em {
		font-style: italic;
		color: #ffe08a;
	}
	.tag {
		padding: 2px 16px 6px;
		border-radius: var(--r-pill);
		background: rgb(255 255 255 / 0.18);
		backdrop-filter: blur(6px);
	}
	.lede {
		margin: 0;
		font-size: 17px;
		font-weight: 700;
		max-width: 34ch;
	}
	.status {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--s2);
	}
	.when {
		font-size: 14px;
		font-weight: 800;
		opacity: 0.95;
	}
	.meter {
		display: grid;
		justify-items: center;
		gap: 6px;
		width: min(100%, 360px);
		padding: var(--s3) var(--s4);
		border-radius: var(--r-md);
		background: rgb(255 255 255 / 0.92);
		color: var(--ink);
		box-shadow: var(--e2);
	}
	.meter :global(> *) {
		width: 100%;
	}
	.left,
	.closed {
		margin: 0;
		font-weight: 800;
	}
	.closed {
		padding: var(--s2) var(--s4);
		border-radius: var(--r-pill);
		background: rgb(255 255 255 / 0.2);
	}
	.sunwrap {
		position: absolute;
		z-index: 1;
		top: -26px;
		right: 6%;
		opacity: 0.9;
		filter: drop-shadow(0 0 40px rgb(255 224 138 / 0.8));
	}
	.frond {
		position: absolute;
		z-index: 1;
		bottom: -40px;
		color: #0b4b3d;
		opacity: 0.5;
	}
	.frond.left {
		left: -120px;
	}
	.frond.right {
		right: -140px;
	}
	.wave {
		position: relative;
		z-index: 2;
		color: var(--bg);
		margin-bottom: -2px;
	}
	/* Compact: a slim strip, so the map gets the screen. */
	.compact {
		padding-top: var(--s3);
		border-radius: 0 0 var(--r-lg) var(--r-lg);
	}
	.compact .inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--s2) var(--s4);
		padding-bottom: var(--s3);
	}
	.compact .wave {
		display: none;
	}
	h1.small {
		font-size: 26px;
		line-height: 32px;
	}
	.compact .sunwrap {
		scale: 0.5;
		transform-origin: top right;
		top: -10px;
	}
	@media (max-width: 600px) {
		.sunwrap {
			top: -50px;
			right: -30px;
			scale: 0.7;
		}
		.frond {
			display: none;
		}
	}
</style>
