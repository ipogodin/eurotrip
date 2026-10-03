<header class="topbar" id="top">
	<div class="wrap">
		<div class="brand">CANARY <span>COMPASS</span></div>
		<nav class="nav" aria-label="Report sections">
			<a href="#ranking">Ranking</a>
			<a href="#map-section">Map</a>
			<a href="#finalists">Villa bases</a>
			<a href="#surf">Surf &amp; beaches</a>
			<a href="#activities">Hikes &amp; attractions</a>
			<a href="#plan">9-day plan</a>
		</nav>
	</div>
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 1000;
		background: rgba(244, 241, 232, 0.9);
		backdrop-filter: blur(14px);
		border-bottom: 1px solid rgba(11, 37, 43, 0.1);
	}
	.topbar .wrap {
		height: 62px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
	}
	.brand {
		font-weight: 900;
		letter-spacing: -0.02em;
	}
	.brand span {
		color: var(--sea);
	}
	.nav {
		display: flex;
		gap: 18px;
		overflow: auto;
		white-space: nowrap;
	}
	.nav a {
		font-size: 0.88rem;
		color: var(--muted);
		text-decoration: none;
		font-weight: 700;
	}
	.nav a:hover {
		color: var(--ink);
	}

	@media (max-width: 650px) {
		.nav {
			display: none;
		}
	}

	@media print {
		.topbar {
			display: none !important;
		}
	}
</style>
