<script>
	import { enhance } from '$app/forms';
	import SeaBackground from '$lib/components/SeaBackground.svelte';
	import Frond from '$lib/components/ui/Frond.svelte';
	import Sun from '$lib/components/ui/Sun.svelte';

	/**
	 * @type {{
	 *   data: { next: string | null },
	 *   form: { message?: string, retryAfter?: number } | null
	 * }}
	 */
	let { data, form } = $props();

	let pending = $state(false);
	/** When the current lockout ends (ms epoch), 0 if none. */
	let until = $state(0);
	let now = $state(0);

	// Mirror the server's lockout in the UI. The server enforces it; this only
	// keeps the button honest and shows a countdown.
	$effect(() => {
		if (form?.retryAfter) until = Date.now() + form.retryAfter * 1000;
	});
	$effect(() => {
		now = Date.now();
		const id = setInterval(() => (now = Date.now()), 500);
		return () => clearInterval(id);
	});

	const remaining = $derived(Math.max(0, Math.ceil((until - now) / 1000)));
	const locked = $derived(remaining > 0);
	const clock = $derived(
		`${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
	);
</script>

<svelte:head>
	<title>Eurotrip · Enter your invite phrase</title>
	<meta name="robots" content="noindex" />
	<meta name="theme-color" content="#d81b60" />
</svelte:head>

<div class="scene">
	<SeaBackground />
	<div class="tint" aria-hidden="true"></div>
	<div class="sun" aria-hidden="true"><Sun size={220} /></div>
	<div class="frond left" aria-hidden="true"><Frond size={420} rotate={-6} /></div>
	<div class="frond right" aria-hidden="true"><Frond size={460} flip rotate={6} /></div>

	<main class="center">
		<form
			class="card"
			method="POST"
			use:enhance={() => {
				pending = true;
				return async ({ update }) => {
					await update({ reset: false });
					pending = false;
				};
			}}
		>
			<div class="brand">
				<Sun size={40} />
				<span>Eurotrip</span>
			</div>
			<p class="t-overline">Canary Islands · February 2027</p>
			<h1 class="t-title">Enter your invite phrase</h1>
			<span class="t-script">¡Bienvenidos!</span>

			<input type="hidden" name="next" value={data.next ?? ''} />
			<!-- Honeypot: invisible to people, tempting to bots. -->
			<div class="trap" aria-hidden="true">
				<label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
			</div>

			<label class="sr-only" for="phrase">Invite phrase</label>
			<input
				id="phrase"
				name="phrase"
				class="field"
				type="text"
				placeholder="word-word"
				autocomplete="off"
				autocapitalize="none"
				autocorrect="off"
				spellcheck="false"
				enterkeyhint="go"
				inputmode="text"
				required
				maxlength="100"
				aria-describedby="hint status"
				aria-invalid={form?.message ? 'true' : undefined}
			/>
			<p id="hint" class="t-caption muted">
				Two words joined by a dash. Lost yours? Ask the trip admin.
			</p>

			<button class="btn btn-primary btn-lg btn-block" type="submit" disabled={pending || locked}>
				{#if pending}
					Checking…
				{:else if locked}
					Try again in {clock}
				{:else}
					Let me in
				{/if}
			</button>

			<p id="status" class="status" role="alert">
				{#if form?.message}{form.message}{#if locked}<span class="sub">Too many tries for now.</span
						>{/if}{/if}
			</p>
		</form>
	</main>

	<p class="credit">
		Video: Frank Vincentz ·
		<a
			href="https://commons.wikimedia.org/wiki/File:P%C3%A1jara_-_Morro_Jable_-_Playa_del_Matorral_(0)_06.ogv"
			rel="external noopener">Playa del Matorral</a
		>, CC BY-SA 3.0
	</p>
</div>

<style>
	.scene {
		position: relative;
		min-height: 100dvh;
		overflow: hidden;
		display: grid;
		background: var(--grad-sunset);
		isolation: isolate;
	}
	/* Sunset glow in the sky, clear sea in the middle, deeper dusk at the
	   bottom so the card edge and the white credit stay readable over sand. */
	.tint {
		position: absolute;
		inset: 0;
		z-index: -3;
		background:
			radial-gradient(60% 45% at 50% 0%, rgb(255 190 90 / 0.55), transparent 70%),
			linear-gradient(
				180deg,
				rgb(255 150 60 / 0.3) 0%,
				rgb(216 27 96 / 0.12) 32%,
				transparent 48%,
				rgb(216 27 96 / 0.18) 70%,
				rgb(91 42 134 / 0.62) 100%
			);
	}
	.sun {
		position: absolute;
		z-index: -2;
		left: 50%;
		top: 5%;
		translate: -50% 0;
		filter: drop-shadow(0 0 60px rgb(255 224 138 / 0.9));
		animation: bob 9s ease-in-out infinite;
	}
	.frond {
		position: absolute;
		z-index: -1;
		bottom: -70px;
		color: #0b4b3d;
		opacity: 0.92;
		transform-origin: bottom center;
		animation: sway 9s ease-in-out infinite alternate;
	}
	.frond.left {
		left: -150px;
	}
	.frond.right {
		right: -170px;
		animation-duration: 11s;
		animation-delay: -3s;
	}
	.center {
		display: grid;
		align-content: end;
		justify-items: center;
		padding: var(--s6) var(--s4) calc(var(--s9) + env(safe-area-inset-bottom));
	}
	.card {
		display: grid;
		gap: var(--s3);
		width: min(440px, 100%);
		padding: var(--s7) var(--s6) var(--s6);
		background: rgb(255 247 232 / 0.84);
		backdrop-filter: blur(18px) saturate(1.3);
		-webkit-backdrop-filter: blur(18px) saturate(1.3);
		border: 2px solid rgb(255 255 255 / 0.7);
		border-radius: var(--r-lg);
		box-shadow: var(--e3);
		animation: rise 700ms var(--spring) both;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: var(--s2);
		font-family: var(--font-display);
		font-variation-settings:
			'SOFT' 100,
			'WONK' 1;
		font-size: 28px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.t-script {
		margin-bottom: var(--s1);
	}
	.trap {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
	.status {
		min-height: 24px;
		margin: 0;
		color: var(--danger);
		font-weight: 800;
		text-align: center;
	}
	.sub {
		display: block;
		font-weight: 600;
	}
	.credit {
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(var(--s3) + env(safe-area-inset-bottom));
		padding: 0 var(--s4);
		margin: 0;
		font-size: 12px;
		line-height: 16px;
		font-weight: 600;
		color: rgb(255 255 255 / 0.85);
		text-align: center;
	}
	.credit a {
		color: inherit;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(24px) scale(0.97);
		}
	}
	@keyframes bob {
		50% {
			transform: translateY(-14px);
		}
	}
	@keyframes sway {
		to {
			transform: rotate(3deg);
		}
	}
	@media (max-width: 767px) {
		/* Keep the small-screen sky clear so the sea shows above the card. */
		.sun {
			left: auto;
			right: -28px;
			top: -28px;
			translate: none;
			scale: 0.55;
			transform-origin: top right;
		}
	}
	@media (min-width: 768px) {
		.center {
			align-content: center;
			padding-bottom: var(--s9);
		}
		.sun {
			left: 74%;
			top: 6%;
		}
	}
</style>
