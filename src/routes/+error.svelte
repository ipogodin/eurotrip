<script>
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	/** What each error says. Fixed copy: the server's own message never reaches the page. */
	const COPY = {
		403: {
			image: '/errors/403.webp',
			alt: 'A grumpy crab in a captain’s cap guards a beach-club gate with its claws crossed.',
			title: 'Staff only.',
			text: 'This part of the island is for the organizer. Your votes are safe.'
		},
		404: {
			image: '/errors/404.webp',
			alt: 'A traveller in a sun hat studies a map upside down on a tiny island, beside a signpost with blank arrows.',
			title: 'This page took a wrong turn.',
			text: 'We couldn’t find it. Let’s get you back to the villas.'
		},
		other: {
			image: '/errors/404.webp',
			alt: 'A traveller in a sun hat studies a map upside down on a tiny island, beside a signpost with blank arrows.',
			title: 'Something went wrong on our side.',
			text: 'Give it a moment and try again. Your votes are safe.'
		}
	};

	const copy = $derived(COPY[/** @type {403 | 404} */ (page.status)] ?? COPY.other);
	const home = $derived(page.data.member ? resolve('/vote') : resolve('/'));
</script>

<svelte:head>
	<title>{page.status} · Eurotrip</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="error">
	<img src={copy.image} alt={copy.alt} width="480" height="480" />
	<p class="code num" aria-hidden="true">{page.status}</p>
	<h1>{copy.title}</h1>
	<p class="text">{copy.text}</p>
	<a class="btn btn-primary" href={home}
		>{page.data.member ? 'Back to the map' : 'Back to sign in'}</a
	>
</main>

<style>
	.error {
		min-height: 100dvh;
		display: grid;
		align-content: center;
		justify-items: center;
		gap: var(--s3);
		padding: var(--s6) var(--s4);
		text-align: center;
		background: var(--bg);
	}
	img {
		width: min(100%, 420px);
		height: auto;
		aspect-ratio: 1;
		border-radius: var(--r-lg, 28px);
		box-shadow: 0 10px 30px rgb(12 59 62 / 0.22);
	}
	.code {
		margin: var(--s2) 0 0;
		font-weight: 800;
		letter-spacing: 0.12em;
		color: var(--hibiscus);
	}
	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 28px;
		line-height: 34px;
		font-weight: 800;
		max-width: 20ch;
	}
	.text {
		margin: 0 0 var(--s3);
		max-width: 34ch;
		color: var(--ink-2);
	}
</style>
