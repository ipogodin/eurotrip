<script>
	import { plans } from '$lib/config/plans.js';

	let activePlan = $state('fue');

	const tabs = [
		['fue', 'Fuerteventura'],
		['ace', 'Lanzarote']
	];

	const days = $derived(plans[activePlan]);
</script>

<section class="planner" id="plan">
	<div class="wrap">
		<div class="section-head">
			<div>
				<p class="eyebrow" style="color:#6ad5c7">A realistic rhythm</p>
				<h2>Nine days without turning it into a surf camp.</h2>
			</div>
			<p>
				The schedule protects three flexible surf windows, two meaningful island days and
				enough open time for ten people and two small children. Swap surf days according to
				the forecast.
			</p>
		</div>
		<div class="tabs">
			{#each tabs as [value, label] (value)}
				<button
					class="tab"
					class:active={activePlan === value}
					onclick={() => (activePlan = value)}
				>
					{label}
				</button>
			{/each}
		</div>
		<div class="days">
			{#each days as [label, title, text] (label)}
				<article class="day">
					<b>{label}</b>
					<h3>{title}</h3>
					<p>{text}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.planner {
		background: #06262b;
		color: white;
	}
	.planner .section-head p {
		color: #bfd5d2;
	}
	.tabs {
		display: flex;
		gap: 8px;
		margin-bottom: 22px;
	}
	.tab {
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 99px;
		background: transparent;
		color: #cbe0dd;
		padding: 10px 16px;
		font-weight: 800;
		cursor: pointer;
	}
	.tab.active {
		color: var(--ink);
		background: var(--sun);
		border-color: var(--sun);
	}
	.days {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}
	.day {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 17px;
		padding: 17px;
	}
	.day b {
		display: block;
		color: var(--sun);
		font-size: 0.74rem;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		margin-bottom: 6px;
	}
	.day h3 {
		font-size: 1rem;
		margin: 0 0 5px;
	}
	.day p {
		font-size: 0.82rem;
		margin: 0;
		color: #bfd5d2;
	}

	@media (max-width: 960px) {
		.days {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 650px) {
		.days {
			grid-template-columns: 1fr;
		}
	}

	@media print {
		.planner {
			background: #073b43 !important;
		}
		.days {
			grid-template-columns: repeat(2, 1fr);
		}
		.day {
			break-inside: avoid;
		}
	}
</style>
