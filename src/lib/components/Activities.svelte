<script>
	import { activities } from '$lib/config/activities.js';
</script>

<section id="activities" style="background:#e9eee9">
	<div class="wrap">
		<div class="section-head">
			<div>
				<p class="eyebrow">Flat-day insurance</p>
				<h2>Hikes and family attractions worth choosing an island for.</h2>
			</div>
			<p>
				February is ideal for lower-elevation walking, but high routes can be cold, windy, snowy or
				closed. With toddlers, treat the harder hikes as adult rotations rather than whole-group
				days.
			</p>
		</div>
		<div class="activity-grid">
			{#each activities as activity (activity.title)}
				<article class="activity">
					<span class="icon">{activity.icon}</span>
					<h3>{activity.title}</h3>
					<p>{activity.text}</p>
					<span class="meta">{activity.meta}</span>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.activity-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
	}
	.activity {
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 18px;
		padding: 19px;
	}
	.activity .icon {
		font-size: 1.5rem;
	}
	.activity h3 {
		margin: 10px 0 8px;
		font-size: 1rem;
	}
	.activity p {
		margin: 0;
		color: var(--muted);
		font-size: 0.84rem;
	}
	.activity .meta {
		display: block;
		margin-top: 10px;
		color: var(--sea);
		font-size: 0.72rem;
		font-weight: 900;
	}

	@media (max-width: 960px) {
		.activity-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 650px) {
		.activity-grid {
			grid-template-columns: 1fr;
		}
	}

	@media print {
		.activity-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.activity {
			break-inside: avoid;
		}
	}
</style>
