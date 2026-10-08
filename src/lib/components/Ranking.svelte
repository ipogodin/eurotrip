<script>
	import { islands } from '$lib/config/islands.js';

	/** @type {{ selectedId: string, onSelect: (id: string, scroll: boolean) => void }} */
	let { selectedId, onSelect } = $props();

	/** @type {[string, import('$lib/config/islands.js').ScoreKey, number][]} */
	const weights = [
		['Surf', 'surf', 45],
		['Sand', 'sand', 25],
		['Hike', 'hike', 18],
		['Family', 'family', 12]
	];

	const topFour = islands.slice(0, 4);
</script>

<section id="ranking">
	<div class="wrap">
		<div class="section-head">
			<div>
				<p class="eyebrow">The short answer</p>
				<h2>A two-island final—with two strong backups.</h2>
			</div>
			<p>
				Scores follow your priorities: surf 45%, sandy beaches 25%, hiking 18%, family attractions
				12%. Villa practicality is shown separately because the $8,000 ceiling is a constraint, not
				a holiday goal.
			</p>
		</div>
		<div class="score-grid">
			{#each topFour as island (island.id)}
				<button
					class="score-card"
					class:active={selectedId === island.id}
					aria-pressed={selectedId === island.id}
					onclick={() => onSelect(island.id, true)}
				>
					<div class="rank">
						<span>#{island.rank} · {island.headline}</span>
						<b>{island.score}</b>
					</div>
					<h3>{island.name}</h3>
					<p>{island.summary}</p>
					<div class="mini-bars">
						{#each weights as [label, key, max] (key)}
							<div class="mini-bar">
								<span>{label}</span>
								<div class="track">
									<div class="fill" style="width:{(island[key] / max) * 100}%"></div>
								</div>
								<b>{island[key]}</b>
							</div>
						{/each}
					</div>
				</button>
			{/each}
		</div>
		<div class="notice">
			<strong>Recommendation:</strong> choose north Fuerteventura unless your group would gladly trade
			a little beach-and-villa convenience for more spectacular volcanic hiking. In that case, choose
			north Lanzarote near Famara.
		</div>
	</div>
</section>

<style>
	.score-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
	}
	.score-card {
		border: 1px solid var(--line);
		background: var(--card);
		border-radius: 20px;
		padding: 20px;
		text-align: left;
		cursor: pointer;
		transition: 0.2s;
		min-height: 190px;
		color: var(--ink);
	}
	.score-card:hover,
	.score-card.active {
		transform: translateY(-3px);
		border-color: var(--sea);
		box-shadow: 0 13px 32px rgba(6, 79, 89, 0.12);
	}
	.score-card.active {
		outline: 3px solid rgba(105, 212, 199, 0.28);
	}
	.rank {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--muted);
		font-size: 0.78rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.09em;
	}
	.rank b {
		font:
			800 1.8rem / 1 Georgia,
			serif;
		color: var(--sea);
	}
	.score-card h3 {
		margin: 16px 0 6px;
		font:
			800 1.35rem / 1.1 Georgia,
			serif;
	}
	.score-card p {
		margin: 0;
		color: var(--muted);
		font-size: 0.88rem;
	}
	.mini-bars {
		margin-top: 16px;
		display: grid;
		gap: 6px;
	}
	.mini-bar {
		display: grid;
		grid-template-columns: 52px 1fr 24px;
		gap: 8px;
		align-items: center;
		font-size: 0.7rem;
		color: var(--muted);
	}
	.track {
		height: 5px;
		border-radius: 9px;
		background: #e4e7e1;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		background: var(--aqua);
		border-radius: 9px;
	}

	@media (max-width: 960px) {
		.score-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 650px) {
		.score-grid {
			grid-template-columns: 1fr;
		}
	}

	@media print {
		.score-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.score-card {
			break-inside: avoid;
		}
	}
</style>
