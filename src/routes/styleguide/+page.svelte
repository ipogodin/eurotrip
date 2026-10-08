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
	import { showToast } from '$lib/components/ui/toast.svelte.js';
	import Icon from '$lib/icons/Icon.svelte';
	import { ICONS } from '$lib/icons/paths.js';

	const iconNames = /** @type {import('$lib/icons/paths.js').IconName[]} */ (Object.keys(ICONS));

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

<main class="page stack" style="gap: var(--s7)">
	<header>
		<p class="t-overline">Dev only</p>
		<h1 class="t-display">Styleguide</h1>
		<p class="muted">Every component and state used by the app. Not available in production.</p>
	</header>

	<section class="stack">
		<h2 class="t-title">Type</h2>
		<p class="t-display">Display 32/40</p>
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
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}
</style>
