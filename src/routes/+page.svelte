<script>
	// legacy report styles: deleted with the report in step 1.4
	import '$lib/legacy-report.css';
	import Topbar from '$lib/components/Topbar.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Ranking from '$lib/components/Ranking.svelte';
	import IslandMap from '$lib/components/IslandMap.svelte';
	import Comparison from '$lib/components/Comparison.svelte';
	import Finalists from '$lib/components/Finalists.svelte';
	import SurfGuide from '$lib/components/SurfGuide.svelte';
	import Activities from '$lib/components/Activities.svelte';
	import Planner from '$lib/components/Planner.svelte';
	import Decision from '$lib/components/Decision.svelte';
	import Sources from '$lib/components/Sources.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let selectedIslandId = $state('fue');

	/**
	 * @param {string} id
	 * @param {boolean} scroll
	 */
	function selectIsland(id, scroll) {
		selectedIslandId = id;
		// Only called from click handlers, so this always runs in the browser.
		if (scroll) document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Canary Islands · February 2027 decision report</title>
	<meta
		name="description"
		content="Interactive Canary Islands decision report for eight adults and two young children travelling in February 2027."
	/>
</svelte:head>

<Topbar />

<main>
	<Hero />
	<Ranking selectedId={selectedIslandId} onSelect={selectIsland} />
	<IslandMap selectedId={selectedIslandId} onSelect={selectIsland} />
	<Comparison />
	<Finalists />
	<SurfGuide />
	<Activities />
	<Planner />
	<Decision />
	<Sources />
</main>

<Footer />
