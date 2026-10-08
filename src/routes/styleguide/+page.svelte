<script>
	import AppBar from '$lib/components/ui/AppBar.svelte';
	import BottomNav from '$lib/components/ui/BottomNav.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import AvatarStack from '$lib/components/ui/AvatarStack.svelte';
	import PointDots from '$lib/components/ui/PointDots.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import PointsMeter from '$lib/components/ui/PointsMeter.svelte';
	import Countdown from '$lib/components/ui/Countdown.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import Sheet from '$lib/components/ui/Sheet.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import Sun from '$lib/components/ui/Sun.svelte';
	import Frond from '$lib/components/ui/Frond.svelte';
	import Wave from '$lib/components/ui/Wave.svelte';
	import { showToast } from '$lib/components/ui/toast.svelte.js';
	import Icon from '$lib/icons/Icon.svelte';
	import { ICONS } from '$lib/icons/paths.js';

	const iconNames = /** @type {import('$lib/icons/paths.js').IconName[]} */ (Object.keys(ICONS));

	const swatches = [
		['hibiscus', '#d81b60'],
		['papaya', '#d2301f'],
		['mango', '#ffb020'],
		['lagoon', '#0aa5a8'],
		['lagoon-deep', '#067a80'],
		['palm', '#1fa971'],
		['ink', '#0c3b3e'],
		['sand', '#ffefd0'],
		['cream', '#fff7e8']
	];

	const members = [
		{ id: 'illia', name: 'Illia Pogodin', short: 'Illia' },
		{ id: 'anna', name: 'Anna Kowalska', short: 'Anna' },
		{ id: 'marek', name: 'Marek Nowak', short: 'Marek' },
		{ id: 'olga', name: 'Olga Petrova', short: 'Olga' },
		{ id: 'tom', name: 'Tom Becker', short: 'Tom' },
		{ id: 'sara', name: 'Sara Lind', short: 'Sara' },
		{ id: 'dima', name: 'Dima Koval', short: 'Dima' },
		{ id: 'eva', name: 'Eva Rossi', short: 'Eva' }
	];

	let view = $state('villas');
	let points = $state(2);
	let sheetOpen = $state(false);
	const spent = $derived(points + 2);
	const soon = new Date(Date.now() + 26 * 3600_000).toISOString();
	const urgent = new Date(Date.now() + 2 * 3600_000).toISOString();
	const final = new Date(Date.now() + 4 * 60_000 + 59_000).toISOString();
	const past = new Date(Date.now() - 1000).toISOString();
</script>

<svelte:head><title>Styleguide · Eurotrip</title></svelte:head>

<AppBar
	member={{ ...members[0], isAdmin: true }}
	nav={[
		{ href: '/vote', label: 'Villas' },
		{ href: '/trip', label: 'Trip' }
	]}
	current="/vote"
>
	<Countdown deadline={soon} />
</AppBar>

<section class="hero">
	<div class="frond left"><Frond size={300} rotate={-10} /></div>
	<div class="frond right"><Frond size={340} flip rotate={8} /></div>
	<div class="sunwrap"><Sun size={150} /></div>
	<div class="hero-inner">
		<span class="t-script hero-script">¡Vamos, familia!</span>
		<h1 class="t-display">Where are we <em>sleeping</em>?</h1>
		<p class="hero-lede">Six points. Three max per villa. One sunny week in the Canaries.</p>
		<div class="row" style="flex-wrap: wrap; justify-content: center">
			<Button size="lg">Cast your votes</Button>
			<Countdown deadline={soon} />
		</div>
	</div>
	<div class="hero-wave"><Wave height={46} /></div>
</section>

<main class="page stack" style="gap: var(--s7)">
	<header>
		<p class="t-overline">Dev only</p>
		<h1 class="t-display">Styleguide</h1>
		<p class="muted">Every component and state used by the app. Not available in production.</p>
	</header>

	<section class="stack">
		<h2 class="t-title">Palette</h2>
		<div class="swatches">
			{#each swatches as [name, hex] (name)}
				<div class="sw">
					<span class="chipbox" style:background={hex}></span>
					<span class="t-caption">{name}</span>
					<span class="t-caption muted num">{hex}</span>
				</div>
			{/each}
		</div>
		<div class="grads">
			<span style:background="var(--grad-cta)">cta</span>
			<span style:background="var(--grad-sun)">sun</span>
			<span style:background="var(--grad-sea)">sea</span>
			<span style:background="var(--grad-sunset)">sunset</span>
		</div>
	</section>

	<section class="stack">
		<h2 class="t-title">Type</h2>
		<p class="t-display">Display <span class="t-display-it">italic</span></p>
		<p><span class="t-script">Script accent: pura vida</span></p>
		<p class="t-title">Title 22</p>
		<p class="t-headline">Headline 17</p>
		<p>Body 15 — Casa Lajares, 14 pts, <span class="num">1,234.50 €</span></p>
		<p class="t-caption muted">Caption 13</p>
		<p class="t-overline">Overline 11</p>
	</section>

	<section class="stack">
		<h2 class="t-title">Buttons</h2>
		<div class="row" style="flex-wrap: wrap">
			<Button>Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="danger">Danger</Button>
			<Button disabled>Disabled</Button>
			<Button size="sm">Small</Button>
			<Button size="lg">Large</Button>
		</div>
		<Button block size="lg" onclick={() => showToast('Saved', 'success')}>Block · toast</Button>
		<div class="row" style="flex-wrap: wrap">
			<Button variant="secondary" size="sm" onclick={() => showToast('Saved', 'success')}
				>Success toast</Button
			>
			<Button variant="secondary" size="sm" onclick={() => showToast('Voting is closed', 'error')}
				>Error toast</Button
			>
		</div>
		<input class="field" placeholder="word-word" aria-label="Sample input" />
	</section>

	<section class="stack">
		<h2 class="t-title">Chips</h2>
		<div class="row" style="flex-wrap: wrap">
			<Chip>Neutral</Chip>
			<Chip tone="accent" icon="pin">Lajares</Chip>
			<Chip tone="sun" icon="trophy">#1</Chip>
			<Chip tone="success" icon="check">Saved</Chip>
			<Chip tone="danger" icon="alert">Closed</Chip>
			<Chip icon="bed">5 bedrooms</Chip>
		</div>
	</section>

	<section class="stack">
		<h2 class="t-title">Members</h2>
		<div class="row" style="flex-wrap: wrap">
			{#each members as m (m.id)}<Avatar member={m} size={40} />{/each}
		</div>
		<AvatarStack {members} max={4} />
		<AvatarStack members={members.slice(0, 3)} />
	</section>

	<section class="stack">
		<h2 class="t-title">Points</h2>
		<div class="row">
			<PointDots value={0} /><PointDots value={1} /><PointDots value={2} /><PointDots value={3} />
		</div>
		<PointsMeter {spent} />
		<Stepper
			value={points}
			canAdd={spent < 6}
			label="Casa Lajares"
			addHint="No points left"
			onchange={(n) => (points = n)}
		/>
		<Stepper value={3} canAdd={true} label="Max" onchange={() => {}} />
		<Stepper value={0} canAdd={false} label="Out of points" onchange={() => {}} />
		<Stepper value={2} canAdd={true} label="Closed" disabled onchange={() => {}} />
	</section>

	<section class="stack">
		<h2 class="t-title">Countdown</h2>
		<div class="row" style="flex-wrap: wrap">
			<Countdown deadline={soon} />
			<Countdown deadline={urgent} />
			<Countdown deadline={final} />
			<Countdown deadline={past} />
		</div>
	</section>

	<section class="stack">
		<h2 class="t-title">Segmented control</h2>
		<SegmentedControl
			label="View"
			value={view}
			onchange={(v) => (view = v)}
			options={[
				{ value: 'villas', label: 'By villa' },
				{ value: 'people', label: 'By person' },
				{ value: 'mine', label: 'My votes' }
			]}
		/>
		<SegmentedControl
			label="Layout"
			value="list"
			onchange={() => {}}
			options={[
				{ value: 'list', label: 'List', icon: 'list' },
				{ value: 'map', label: 'Map', icon: 'map' }
			]}
		/>
	</section>

	<section class="stack">
		<h2 class="t-title">Card, skeleton, sheet</h2>
		<Card>
			<div class="stack" style="gap: var(--s2)">
				<Skeleton height="120px" radius="var(--r-md)" />
				<Skeleton width="60%" />
				<Skeleton width="40%" height="12px" />
			</div>
		</Card>
		<div><Button variant="secondary" onclick={() => (sheetOpen = true)}>Open sheet</Button></div>
		<Sheet open={sheetOpen} title="Pick this villa?" onclose={() => (sheetOpen = false)}>
			<p class="muted" style="margin-bottom: var(--s4)">
				This closes voting for everyone. You can undo it later.
			</p>
			<div class="row">
				<Button variant="secondary" onclick={() => (sheetOpen = false)}>Cancel</Button>
				<Button onclick={() => (sheetOpen = false)}>Confirm</Button>
			</div>
		</Sheet>
	</section>

	<section class="stack">
		<h2 class="t-title">Icons</h2>
		<div class="icons">
			{#each iconNames as name (name)}
				<span class="icon-cell">
					<Icon {name} size={22} />
					<span class="t-caption muted">{name}</span>
				</span>
			{/each}
		</div>
	</section>
</main>

<BottomNav
	current="/vote"
	items={[
		{ href: '/vote', label: 'Villas', icon: 'home' },
		{ href: '/people', label: 'People', icon: 'users' },
		{ href: '/mine', label: 'My votes', icon: 'check' }
	]}
/>

<style>
	.hero {
		position: relative;
		overflow: hidden;
		background: var(--grad-sunset);
		color: #fff;
		text-align: center;
		padding: var(--s9) 0 0;
	}
	.hero-inner {
		position: relative;
		z-index: 2;
		display: grid;
		justify-items: center;
		gap: var(--s4);
		max-width: 640px;
		margin-inline: auto;
		padding: 0 var(--s4) var(--s9);
	}
	.hero :global(.t-display) {
		text-shadow: 0 2px 20px rgb(91 42 134 / 0.35);
	}
	.hero :global(.t-display em) {
		font-style: italic;
		color: #ffe08a;
	}
	.hero-script {
		color: #fff;
		background: rgb(255 255 255 / 0.18);
		padding: 2px 16px 6px;
		border-radius: var(--r-pill);
		backdrop-filter: blur(6px);
	}
	.hero-lede {
		font-size: 18px;
		font-weight: 700;
		opacity: 0.95;
	}
	.sunwrap {
		position: absolute;
		z-index: 1;
		top: -30px;
		right: 8%;
		opacity: 0.9;
		filter: drop-shadow(0 0 40px rgb(255 224 138 / 0.8));
		animation: float 7s ease-in-out infinite;
	}
	.frond {
		position: absolute;
		z-index: 1;
		color: rgb(8 90 70 / 0.34);
		bottom: -30px;
	}
	.frond.left {
		left: -90px;
	}
	.frond.right {
		right: -100px;
		bottom: 40px;
	}
	.hero-wave {
		position: relative;
		z-index: 2;
		color: var(--bg);
		margin-bottom: -2px;
	}
	@keyframes float {
		50% {
			transform: translateY(10px) rotate(6deg);
		}
	}
	.swatches {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
		gap: var(--s3);
	}
	.sw {
		display: grid;
		gap: 2px;
	}
	.chipbox {
		height: 56px;
		border-radius: var(--r-md);
		box-shadow: var(--e1);
	}
	.grads {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--s2);
	}
	.grads span {
		display: grid;
		place-items: center;
		height: 48px;
		border-radius: var(--r-md);
		color: #fff;
		font-weight: 800;
		text-shadow: 0 1px 4px rgb(0 0 0 / 0.35);
	}
	.icons {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
		gap: var(--s3);
	}
	.icon-cell {
		display: grid;
		justify-items: center;
		gap: 4px;
		padding: var(--s3);
		background: var(--surface);
		border: 2px solid var(--line);
		border-radius: var(--r-md);
	}
</style>
