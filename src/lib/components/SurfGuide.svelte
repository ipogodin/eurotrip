<script>
	import { spots } from '$lib/config/spots.js';
	import { schools } from '$lib/config/schools.js';

	let activeFilter = $state('all');

	const filtered = $derived(
		activeFilter === 'all' ? spots : spots.filter((s) => s.kind.includes(activeFilter))
	);

	const filters = [
		['all', 'Show all'],
		['surf', 'Surf'],
		['sand', 'Sandy beach'],
		['hike', 'Hike'],
		['family', 'Family']
	];

	/** @type {Record<string, string>} */
	const chipLabels = { surf: 'Surf', sand: 'Sand', hike: 'Hike', family: 'Family' };
</script>

<section id="surf">
	<div class="wrap">
		<div class="section-head">
			<div>
				<p class="eyebrow">Surf and sand field guide</p>
				<h2>The breaks and beaches that actually fit.</h2>
			</div>
			<p>
				"Beginner-friendly" still means condition-dependent in February. North Atlantic swells can
				be powerful; use a school that selects the beach daily, especially on Fuerteventura and
				Lanzarote.
			</p>
		</div>
		<div class="guide-tools" role="group" aria-label="Filter locations">
			{#each filters as [value, label] (value)}
				<button
					class="filter-btn"
					class:active={activeFilter === value}
					aria-pressed={activeFilter === value}
					onclick={() => (activeFilter = value)}
				>
					{label}
				</button>
			{/each}
		</div>
		<div class="spot-grid">
			{#each filtered as spot (spot.title)}
				<article class="spot-card">
					<span class="place">{spot.place}</span>
					<h3>{spot.title}</h3>
					<p>{spot.text}</p>
					<div class="chips">
						{#each spot.kind as kind (kind)}
							<span class="chip {kind}">{chipLabels[kind]}</span>
						{/each}
					</div>
				</article>
			{/each}
		</div>

		<div class="notice">
			<strong>Surf safety:</strong> for independent intermediate sessions, ask the school for tide, wind,
			entry/exit and local-etiquette advice that morning. Reefs around Las Américas, La Santa, the Fuerteventura
			North Shore and El Confital are not learner substitutions when beach breaks are too large.
		</div>

		<h3 class="anchors-head">School and rental anchors</h3>
		<div class="comparison-wrap">
			<table>
				<thead>
					<tr>
						<th>Island / base</th>
						<th>Provider</th>
						<th>Observed price</th>
						<th>Why it is useful</th>
						<th>Verify before booking</th>
					</tr>
				</thead>
				<tbody>
					{#each schools as school (school.name)}
						<tr>
							<td><strong>{school.base}</strong></td>
							<td><a href={school.url} rel="external">{school.name}</a></td>
							<td>{school.price}</td>
							<td>{school.why}</td>
							<td>{school.verify}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="fineprint">
			Prices were visible on provider pages on 2 October 2026 and are planning estimates, not quotes
			for February 2027.
		</p>
	</div>
</section>

<style>
	.anchors-head {
		font:
			800 2rem / 1 Georgia,
			serif;
		margin-top: 48px;
	}
	.guide-tools {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 20px;
	}
	.filter-btn {
		border: 1px solid var(--line);
		background: var(--card);
		color: var(--muted);
		border-radius: 99px;
		padding: 9px 14px;
		font-weight: 800;
		cursor: pointer;
	}
	.filter-btn.active,
	.filter-btn:hover {
		background: var(--ink);
		border-color: var(--ink);
		color: white;
	}
	.spot-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
	.spot-card {
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 18px;
		padding: 18px;
		display: flex;
		flex-direction: column;
	}
	.spot-card h3 {
		margin: 0 0 5px;
		font:
			800 1.2rem / 1.15 Georgia,
			serif;
	}
	.spot-card .place {
		color: var(--sea);
		font-weight: 800;
		font-size: 0.8rem;
	}
	.spot-card p {
		color: var(--muted);
		font-size: 0.87rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: auto;
	}
	.chip {
		border-radius: 99px;
		padding: 5px 8px;
		background: #edf1ed;
		font-size: 0.68rem;
		font-weight: 800;
		color: #405c60;
	}
	.chip.sand {
		background: #fff0c9;
		color: #785014;
	}
	.chip.surf {
		background: #dff3f0;
		color: #075965;
	}
	.chip.hike {
		background: #e6efda;
		color: #365c21;
	}
	.chip.family {
		background: #f6e1de;
		color: #7c3e34;
	}

	@media (max-width: 960px) {
		.spot-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 650px) {
		.spot-grid {
			grid-template-columns: 1fr;
		}
	}

	@media print {
		.guide-tools {
			display: none !important;
		}
		.spot-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.spot-card {
			break-inside: avoid;
		}
	}
</style>
