<!--
	Full-bleed looping beach video (Playa del Matorral, Fuerteventura) for the
	login splash. The still poster is always rendered (SSR, instant); the video
	is only added in the browser, and never under prefers-reduced-motion or
	Save-Data, so those visitors don't download it at all.
-->
<script>
	let motionOk = $state(false);
	let playing = $state(false);

	$effect(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
		const conn = /** @type {{ connection?: { saveData?: boolean } }} */ (navigator).connection;
		const update = () => (motionOk = !reduce.matches && !conn?.saveData);
		update();
		reduce.addEventListener('change', update);
		return () => reduce.removeEventListener('change', update);
	});

	/**
	 * Svelte sets `muted` as a property, not an attribute, on client-created
	 * videos; iOS Safari may then refuse to autoplay. Mute + play explicitly.
	 * If autoplay is still blocked (e.g. Low Power Mode) the poster stays.
	 * @param {HTMLVideoElement} video
	 */
	function startMuted(video) {
		video.muted = true;
		video.setAttribute('muted', '');
		video.play().catch(() => {});
	}
</script>

<div class="bg" aria-hidden="true">
	<img
		src="/splash/sea-poster-854.webp"
		srcset="/splash/sea-poster-854.webp 854w, /splash/sea-poster-1280.webp 1280w"
		sizes="100vw"
		alt=""
		width="1280"
		height="720"
		fetchpriority="high"
	/>
	{#if motionOk}
		<video
			class:playing
			autoplay
			muted
			loop
			playsinline
			disablepictureinpicture
			preload="auto"
			onplaying={() => (playing = true)}
			{@attach startMuted}
		>
			<source src="/splash/sea-854.mp4" type="video/mp4" media="(max-width: 900px)" />
			<source src="/splash/sea-1280.mp4" type="video/mp4" />
		</video>
	{/if}
</div>

<style>
	.bg {
		position: absolute;
		inset: 0;
		z-index: -4;
		background: #9cc6e4;
	}
	img,
	video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Keep the breaking waves (right of centre) in frame on tall phones. */
		object-position: 62% 40%;
	}
	video {
		opacity: 0;
		transition: opacity 1.2s ease;
	}
	video.playing {
		opacity: 1;
	}
	/* Tall phone screens: drop part of the sky so the sea sits above the
	   login card instead of behind it. */
	@media (max-width: 767px) and (orientation: portrait) {
		img,
		video {
			top: -24%;
			height: 124%;
		}
	}
</style>
