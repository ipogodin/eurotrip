<script>
	import { resolve } from '$app/paths';
	import { OUTLINE, PLACES, TEIDE, VIEW, project } from '$lib/config/tenerife.js';
	import { villas } from '$lib/config/villas.js';
	import { smoothClosedPath, spreadPins } from '$lib/map-layout.js';

	/**
	 * Tenerife with each villa as a photo. Tap a photo to open the villa's
	 * page (where you vote). The photo shows your points and the group rank.
	 * @type {{
	 *   rows: import('./types.js').VillaRow[],
	 *   winnerId: string | null
	 * }}
	 */
	let { rows, winnerId } = $props();

	// Pin size is 12.5% of the map width (capped), so the spreading distance
	// matches the on-screen size. Laid out in config order, so pins never jump
	// when the ranking changes.
	const PIN_UNITS = 125;
	const pins = new Map(
		spreadPins(
			villas.map((v) => ({ id: v.id, ...project(v.coords) })),
			{ minDist: PIN_UNITS, width: VIEW.w, height: VIEW.h, margin: PIN_UNITS / 2 }
		).map((p) => [p.id, p])
	);

	const island = smoothClosedPath(OUTLINE);
	const pct = (/** @type {number} */ v, /** @type {number} */ of) => `${(v / of) * 100}%`;
</script>

<figure class="map">
	<div class="stage">
		<svg viewBox="0 0 {VIEW.w} {VIEW.h}" role="presentation" aria-hidden="true">
			<defs>
				<linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color="#d7ecb8" />
					<stop offset="1" stop-color="#ffe9b8" />
				</linearGradient>
			</defs>
			<!-- A few soft wave lines, then the island and its shadow -->
			<g class="waves">
				<path d="M20 120 q60-30 120 0 t120 0 t120 0" />
				<path d="M700 780 q60-30 120 0 t120 0" />
				<path d="M40 560 q50-26 100 0 t100 0" />
				<path d="M780 60 q50-26 100 0 t80 0" />
			</g>
			<path class="shadow" d={island} transform="translate(8 14)" />
			<path class="land" d={island} fill="url(#land)" />
			<path
				class="peak"
				d="M{TEIDE.x - 22} {TEIDE.y + 14} L{TEIDE.x} {TEIDE.y - 22} L{TEIDE.x + 22} {TEIDE.y + 14}Z"
			/>
			<text class="place teide" x={TEIDE.x} y={TEIDE.y + 34} text-anchor="middle">Teide</text>
			{#each PLACES as p (p.text)}
				<text class="place" x={p.at.x} y={p.at.y} text-anchor="middle">{p.text}</text>
			{/each}
			<!-- Thin leader from each photo back to the villa's true spot -->
			{#each rows as row (row.villa.id)}
				{@const pin = pins.get(row.villa.id)}
				{#if pin && Math.hypot(pin.x - pin.ax, pin.y - pin.ay) > 14}
					<line class="leader" x1={pin.ax} y1={pin.ay} x2={pin.x} y2={pin.y} />
				{/if}
				{#if pin}<circle class="dot" cx={pin.ax} cy={pin.ay} r="6" />{/if}
			{/each}
		</svg>

		{#each rows as row (row.villa.id)}
			{@const pin = pins.get(row.villa.id)}
			{@const cover = row.villa.photos[0]}
			{#if pin}
				<a
					class="pin"
					class:mine={row.myPoints > 0}
					class:winner={row.villa.id === winnerId}
					href={resolve('/villas/[id]', { id: row.villa.id })}
					style:left={pct(pin.x, VIEW.w)}
					style:top={pct(pin.y, VIEW.h)}
					aria-label="{row.villa.name}, {row.villa.town}. {row.myPoints
						? `You gave ${row.myPoints} point${row.myPoints === 1 ? '' : 's'}. `
						: ''}{row.total} point{row.total === 1 ? '' : 's'} in total{row.rank
						? `, ranked ${row.rank}`
						: ''}. Open to see it and vote."
				>
					{#if cover}
						<img
							src={cover.thumb}
							alt=""
							width={cover.width}
							height={cover.height}
							decoding="async"
						/>
					{/if}
					<span class="name">{row.villa.name}</span>
					{#if row.rank}<span class="rank" class:gold={row.rank === 1}>#{row.rank}</span>{/if}
					{#if row.myPoints}<span class="mine-badge num">{row.myPoints}</span>{/if}
				</a>
			{/if}
		{/each}
	</div>
	<figcaption>
		Tap a photo to open the villa and vote. Positions are approximate; thin lines point to the real
		spot.
	</figcaption>
</figure>

<style>
	.map {
		margin: 0;
		display: grid;
		justify-items: center;
		gap: var(--s2);
	}
	.stage {
		position: relative;
		container-type: inline-size;
		/* As big as the screen allows without cutting the island */
		width: min(100%, calc((100dvh - 290px) * 1000 / 880));
		aspect-ratio: 1000 / 880;
		border-radius: var(--r-lg);
		overflow: hidden;
		background:
			radial-gradient(60% 50% at 30% 20%, rgb(255 255 255 / 0.45), transparent 70%),
			linear-gradient(180deg, #bfe9ee, #8fd3dc);
		border: 2px solid var(--line);
		box-shadow: var(--e2);
	}
	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.waves path {
		fill: none;
		stroke: rgb(255 255 255 / 0.55);
		stroke-width: 5;
		stroke-linecap: round;
	}
	.shadow {
		fill: rgb(6 122 128 / 0.22);
	}
	.land {
		stroke: #e9bf68;
		stroke-width: 6;
		stroke-linejoin: round;
	}
	.peak {
		fill: #cfae7c;
		stroke: #b58f5c;
		stroke-width: 3;
		stroke-linejoin: round;
	}
	.place {
		fill: rgb(12 59 62 / 0.55);
		font-size: 24px;
		font-weight: 800;
		letter-spacing: 0.02em;
	}
	.teide {
		font-size: 20px;
	}
	.leader {
		stroke: rgb(12 59 62 / 0.45);
		stroke-width: 3;
		stroke-dasharray: 2 8;
		stroke-linecap: round;
	}
	.dot {
		fill: var(--hibiscus);
		stroke: #fff;
		stroke-width: 3;
	}

	.pin {
		--size: min(12.5cqw, 112px);
		position: absolute;
		width: var(--size);
		height: var(--size);
		translate: -50% -50%;
		display: block;
		border-radius: 50%;
		border: 3px solid #fff;
		background: var(--surface-2);
		box-shadow: 0 6px 16px rgb(12 59 62 / 0.35);
		-webkit-touch-callout: none;
		transition:
			transform var(--t-ui) var(--spring),
			box-shadow var(--t-ui) ease;
	}
	.pin img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
		display: block;
	}
	.pin:hover,
	.pin:focus-visible {
		z-index: 5;
		transform: scale(1.18);
		box-shadow: 0 10px 24px rgb(12 59 62 / 0.45);
	}
	.pin.mine {
		border-color: var(--hibiscus);
	}
	.pin.winner {
		border-color: var(--mango);
		box-shadow:
			0 0 0 5px rgb(255 176 32 / 0.5),
			0 6px 16px rgb(12 59 62 / 0.35);
	}
	/* The name only appears where there's room: big screens, or on hover/focus. */
	.name {
		position: absolute;
		left: 50%;
		top: 100%;
		translate: -50% 4px;
		padding: 1px 8px;
		border-radius: var(--r-pill);
		background: rgb(255 255 255 / 0.94);
		color: var(--ink);
		font-size: 11px;
		font-weight: 800;
		line-height: 16px;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--t-ui) ease;
	}
	.pin:hover .name,
	.pin:focus-visible .name {
		opacity: 1;
	}
	@container (min-width: 760px) {
		.name {
			opacity: 1;
		}
	}
	.rank,
	.mine-badge {
		position: absolute;
		display: grid;
		place-items: center;
		min-width: 20px;
		height: 20px;
		padding: 0 5px;
		border-radius: var(--r-pill);
		font-size: 11px;
		font-weight: 900;
		line-height: 1;
		box-shadow: 0 2px 6px rgb(12 59 62 / 0.35);
	}
	.rank {
		left: -8px;
		top: -8px;
		background: #fff;
		color: var(--ink);
	}
	.rank.gold {
		background: var(--grad-sun);
	}
	.mine-badge {
		right: -8px;
		bottom: -8px;
		min-width: 24px;
		height: 24px;
		background: var(--hibiscus);
		color: #fff;
		font-size: 13px;
	}
	figcaption {
		max-width: 56ch;
		margin: 0;
		color: var(--ink-3);
		font-size: 13px;
		font-weight: 700;
		text-align: center;
	}
</style>
