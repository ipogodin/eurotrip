<section id="decision">
	<div class="wrap">
		<div class="section-head">
			<div>
				<p class="eyebrow">Decision rules</p>
				<h2>Make the choice in one conversation.</h2>
			</div>
			<p>
				Ask everyone to choose which compromise they are happiest to live with—not which island
				has the longest attraction list.
			</p>
		</div>
		<div class="decision">
			<div class="choose winner-box">
				<h3>Choose Fuerteventura if…</h3>
				<ul>
					<li><strong>Surfing and sand must coexist</strong> without splitting the group.</li>
					<li>You want several school-led spot options rather than relying on one beach.</li>
					<li>A big, detached villa and outdoor living matter more than lush scenery.</li>
					<li>The group is comfortable with wind, driving and a stark landscape.</li>
				</ul>
			</div>
			<div class="choose">
				<h3>Choose Lanzarote if…</h3>
				<ul>
					<li>You want <strong>one iconic sandy surf beach</strong> as the trip's centre of gravity.</li>
					<li>Volcanic walks and César Manrique sites are the decisive tie-breaker.</li>
					<li>You can accept a rural villa 10–20 minutes from Famara.</li>
					<li>You want La Graciosa as a standout family day.</li>
				</ul>
			</div>
			<div class="choose">
				<h3>Choose Gran Canaria if…</h3>
				<ul>
					<li>The surfers value a <strong>walkable urban beach break</strong> and coaching.</li>
					<li>The group enjoys city restaurants, museums and an aquarium.</li>
					<li>You can find a rare large house near Las Palmas—or accept a city-villa compromise.</li>
				</ul>
			</div>
			<div class="choose">
				<h3>Choose Tenerife if…</h3>
				<ul>
					<li>Family attractions and hiking move above sandy surf in priority.</li>
					<li>The intermediate surfers are comfortable with reef and local guidance.</li>
					<li>You want the deepest verified villa shortlist and the warmest-feeling south-coast base.</li>
				</ul>
			</div>
		</div>

		<h3 class="budget-head">Budget and booking guardrails</h3>
		<div class="budget">
			<div class="budget-card">
				<b>$8,000</b>
				<p>
					Hard villa ceiling. That is about <strong>$1,000/night for eight nights</strong> or
					<strong>$889/night for nine nights</strong>, all-in.
				</p>
			</div>
			<div class="budget-card">
				<b>4 + 3</b>
				<p>
					Minimum target: four real couple bedrooms and three bathrooms. Do not count sofa beds
					as a couple's room.
				</p>
			</div>
			<div class="budget-card">
				<b>2 cars</b>
				<p>
					North Fuerteventura and rural Lanzarote work best with two cars; confirm parking and
					board transport before booking.
				</p>
			</div>
		</div>
		<div class="notice">
			<strong>Villa search order:</strong> (1) Lajares, Corralejo edge, Villaverde and El Cotillo;
			(2) Soo, Muñique, Tinajo and Famara; (3) Las Palmas west / Arucas; (4) Callao Salvaje / Playa
			Paraíso. Require an all-in total, legal tourist-registration number, two cots and high
			chairs, parking for two cars, and explicit pool-barrier information. A heated pool is
			strongly preferable in February; ask whether heat is included or charged daily.
		</div>
	</div>
</section>

<style>
	.budget-head {
		font: 800 2rem / 1 Georgia, serif;
		margin-top: 54px;
	}
	.decision {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
	}
	.choose {
		background: var(--card);
		border-radius: 22px;
		padding: 24px;
		border: 1px solid var(--line);
	}
	.choose h3 {
		font: 800 1.45rem / 1.15 Georgia, serif;
		margin: 0 0 14px;
	}
	.choose ul {
		padding-left: 20px;
		color: var(--muted);
	}
	.choose strong {
		color: var(--ink);
	}
	.winner-box {
		background: var(--sun);
		border: 0;
		transform: rotate(-0.5deg);
	}
	.budget {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
	.budget-card {
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 18px;
		padding: 20px;
	}
	.budget-card b {
		display: block;
		font: 800 2rem / 1 Georgia, serif;
		color: var(--sea);
		margin-bottom: 8px;
	}
	.budget-card p {
		margin: 0;
		color: var(--muted);
		font-size: 0.86rem;
	}

	@media (max-width: 650px) {
		.decision,
		.budget {
			grid-template-columns: 1fr;
		}
	}
</style>
