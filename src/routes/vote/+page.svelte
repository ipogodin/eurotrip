<script>
	import AppBar from '$lib/components/ui/AppBar.svelte';
	import BottomNav from '$lib/components/ui/BottomNav.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	/** @type {{ data: { member: import('$lib/server/members.js').PublicMember | null } }} */
	let { data } = $props();
</script>

<svelte:head><title>Vote · Eurotrip</title></svelte:head>

<AppBar member={data.member} nav={[{ href: '/vote', label: 'Villas' }]} current="/vote" />

<main class="page stack">
	<p class="t-overline">Coming next</p>
	<h1 class="t-display">Hi {data.member?.short}!</h1>
	<Card>
		<p>You're in. Voting opens here soon.</p>
	</Card>
</main>

<BottomNav current="/vote" items={[{ href: '/vote', label: 'Villas', icon: 'home' }]} />
