<script>
	import { islands } from '$lib/config/islands.js';

	function fitClass(villa) {
		if (villa === 'High') return 'high';
		if (villa === 'Low' || villa === 'Very low') return 'low';
		return 'medium';
	}
</script>

<section id="comparison">
	<div class="wrap">
		<div class="section-head">
			<div>
				<p class="eyebrow">All inhabited islands</p>
				<h2>Nothing hidden in the average.</h2>
			</div>
			<p>
				A strong hiking score cannot rescue weak learner surf, and famous waves do not help if
				the group needs reef expertise. The notes below emphasize the actual February fit.
			</p>
		</div>
		<div class="comparison-wrap">
			<table>
				<thead>
					<tr>
						<th>Island</th>
						<th>Activity score</th>
						<th>Surf reality</th>
						<th>Sandy beach reality</th>
						<th>Best villa base</th>
						<th>Villa fit</th>
						<th>Bottom line</th>
					</tr>
				</thead>
				<tbody>
					{#each islands as island (island.id)}
						<tr class:winner-row={island.rank === 1}>
							<td
								><strong>#{island.rank} {island.name}</strong><br /><span class="fineprint"
									>{island.short}</span
								></td
							>
							<td class="score-big">{island.score}/100</td>
							<td>{island.surfText}</td>
							<td>{island.sandText}</td>
							<td>{island.best}</td>
							<td><span class="fit {fitClass(island.villa)}">{island.villa}</span></td>
							<td>{island.bottom}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>
