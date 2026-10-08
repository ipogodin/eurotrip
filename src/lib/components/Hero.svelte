<section class="hero">
	<div class="wrap hero-grid">
		<div>
			<p class="eyebrow" style="color:#7fe0d3">Island decision report · February 2027</p>
			<h1>Find the island where the whole group wins.</h1>
			<p class="lead">
				A surf-first comparison for 8 adults and 2 young children, with sandy beaches, hiking and
				family days ranked in that order—plus the villa bases that keep ten people close to the
				water.
			</p>
			<div class="hero-meta">
				<span class="pill">9-day target</span>
				<span class="pill">$8,000 villa ceiling</span>
				<span class="pill">Beginner–intermediate surf</span>
				<span class="pill">February conditions</span>
			</div>
			<p class="hero-credit">
				Hero: Corralejo dunes by
				<a
					href="https://commons.wikimedia.org/wiki/File:Arena_y_viento,_Dunas_de_Corralejo,_Fuerteventura,_Espa%C3%B1a,_2015.jpg"
				>
					Wikimedia Commons</a
				>, CC BY-SA.
			</p>
		</div>
		<aside class="verdict" aria-label="Top recommendation">
			<p class="eyebrow">Current verdict</p>
			<div class="number">#1</div>
			<h2>Fuerteventura<br />North coast</h2>
			<p>
				Base in <strong>Lajares or Corralejo</strong>. The best overlap of mobile surf schools,
				sand, large villas and easy non-surf days.
			</p>
		</aside>
	</div>
</section>

<style>
	.hero {
		background:
			linear-gradient(115deg, rgba(3, 35, 42, 0.93), rgba(3, 77, 86, 0.78)),
			url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Arena_y_viento%2C_Dunas_de_Corralejo%2C_Fuerteventura%2C_Espa%C3%B1a%2C_2015.jpg/1280px-Arena_y_viento%2C_Dunas_de_Corralejo%2C_Fuerteventura%2C_Espa%C3%B1a%2C_2015.jpg')
				center 58% / cover;
		color: white;
		padding: 76px 0 58px;
		min-height: 560px;
		display: flex;
		align-items: end;
	}
	.hero-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
		gap: 48px;
		align-items: end;
	}
	.hero h1 {
		font:
			800 clamp(2.7rem, 7vw, 6rem) / 0.94 Georgia,
			serif;
		letter-spacing: -0.05em;
		margin: 0 0 24px;
		max-width: 890px;
	}
	.hero .lead {
		font-size: 1.15rem;
		line-height: 1.65;
		max-width: 730px;
		color: #e6f4f2;
	}
	.hero-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 28px;
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		border: 1px solid rgba(255, 255, 255, 0.28);
		border-radius: 99px;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.09);
		font-size: 0.82rem;
		font-weight: 700;
	}
	.verdict {
		background: rgba(255, 253, 247, 0.95);
		color: var(--ink);
		padding: 24px;
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}
	.verdict .number {
		font:
			800 4rem / 1 Georgia,
			serif;
		color: var(--sea);
	}
	.verdict h2 {
		font:
			800 1.5rem / 1.15 Georgia,
			serif;
		margin: 8px 0;
	}
	.verdict p {
		margin: 0;
		color: var(--muted);
	}
	.hero-credit {
		margin-top: 18px;
		font-size: 0.72rem;
		color: #bdd2d0;
	}
	.hero-credit a {
		color: #e7f4f1;
	}

	@media (max-width: 960px) {
		.hero-grid {
			grid-template-columns: 1fr;
		}
		.hero {
			padding-top: 110px;
		}
	}

	@media (max-width: 650px) {
		.hero {
			min-height: 650px;
		}
		.hero h1 {
			font-size: 3.15rem;
		}
	}

	@media print {
		.hero {
			min-height: auto;
			padding: 40px 0;
			background: #073b43 !important;
		}
	}
</style>
