<script>
	import { islands } from '$lib/config/islands.js';

	let { selectedId, onSelect } = $props();

	const selected = $derived(islands.find((i) => i.id === selectedId));

	function activate(id) {
		onSelect(id, false);
	}

	function onKeydown(event, id) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			activate(id);
		}
	}
</script>

<section id="map-section" style="padding-top:10px">
	<div class="wrap">
		<div class="section-head">
			<div>
				<p class="eyebrow">Explore the archipelago</p>
				<h2>Click an island. See the trade-off.</h2>
			</div>
			<p>
				The map also marks the most useful bases. Zoom in for the geography behind the
				recommendation: on the winning islands, villas, sand and surf sit in the same compact
				northern zone.
			</p>
		</div>
		<div class="map-shell">
			<div
				id="map"
				role="application"
				aria-label="Interactive map of the Canary Islands. Select an island to update the comparison panel."
			>
				<svg
					class="archipelago-map"
					viewBox="0 0 1000 560"
					role="img"
					aria-labelledby="mapTitle mapDesc"
					preserveAspectRatio="xMidYMid meet"
				>
					<title id="mapTitle">Interactive Canary Islands map</title>
					<desc id="mapDesc"
						>Eight selectable island shapes arranged west to east, with recommended bases
						marked on the four leading islands.</desc
					>
					<path class="ocean-line" d="M-40 92 C170 8 345 122 535 59 S859 7 1040 92" />
					<path class="ocean-line" d="M-45 450 C164 359 334 494 552 417 S853 366 1050 438" />
					<path class="ocean-line" d="M28 278 C204 212 360 321 520 264 S822 205 987 272" />
					<text class="map-caption" x="36" y="42">Atlantic Ocean · west</text>
					<text class="map-caption" x="963" y="522" text-anchor="end">Africa · east</text>

					<g
						class="island-node"
						class:selected={selectedId === 'spc'}
						data-id="spc"
						tabindex="0"
						role="button"
						aria-label="Select La Palma, ranked fifth"
						onclick={() => activate('spc')}
						onkeydown={(e) => onKeydown(e, 'spc')}
					>
						<path
							class="island-shape"
							d="M106 102 C88 122 87 155 97 184 C108 214 132 224 148 201 C164 178 158 145 142 119 C132 102 119 95 106 102 Z"
						/>
						<circle class="rank-badge" cx="92" cy="101" r="15" /><text
							class="island-number"
							x="92"
							y="101">5</text
						><text class="island-name" x="126" y="246">La Palma</text>
					</g>
					<g
						class="island-node"
						class:selected={selectedId === 'vde'}
						data-id="vde"
						tabindex="0"
						role="button"
						aria-label="Select El Hierro, ranked seventh"
						onclick={() => activate('vde')}
						onkeydown={(e) => onKeydown(e, 'vde')}
					>
						<path
							class="island-shape"
							d="M62 392 C77 376 104 374 118 389 C128 400 120 421 105 433 C88 447 61 440 51 422 C46 412 51 402 62 392 Z"
						/>
						<circle class="rank-badge" cx="48" cy="386" r="15" /><text
							class="island-number"
							x="48"
							y="386">7</text
						><text class="island-name" x="88" y="469">El Hierro</text>
					</g>
					<g
						class="island-node"
						class:selected={selectedId === 'gmz'}
						data-id="gmz"
						tabindex="0"
						role="button"
						aria-label="Select La Gomera, ranked sixth"
						onclick={() => activate('gmz')}
						onkeydown={(e) => onKeydown(e, 'gmz')}
					>
						<path
							class="island-shape"
							d="M229 312 C245 293 278 287 298 302 C315 316 309 341 291 355 C269 371 235 363 222 344 C215 334 218 322 229 312 Z"
						/>
						<circle class="rank-badge" cx="220" cy="302" r="15" /><text
							class="island-number"
							x="220"
							y="302">6</text
						><text class="island-name" x="266" y="392">La Gomera</text>
					</g>
					<g
						class="island-node"
						class:selected={selectedId === 'tfs'}
						data-id="tfs"
						tabindex="0"
						role="button"
						aria-label="Select Tenerife, ranked fourth"
						onclick={() => activate('tfs')}
						onkeydown={(e) => onKeydown(e, 'tfs')}
					>
						<path
							class="island-shape"
							d="M332 214 C361 194 403 188 432 202 C448 210 444 226 423 242 C401 258 391 284 370 306 C352 325 327 321 318 302 C309 284 320 265 315 248 C310 231 317 221 332 214 Z"
						/>
						<circle class="rank-badge" cx="320" cy="205" r="15" /><text
							class="island-number"
							x="320"
							y="205">4</text
						><text class="island-name" x="376" y="350">Tenerife</text>
						<circle class="base-dot" cx="368" cy="291" r="7" /><text
							class="base-label"
							x="380"
							y="294">Las Américas</text
						>
					</g>
					<g
						class="island-node"
						class:selected={selectedId === 'lpa'}
						data-id="lpa"
						tabindex="0"
						role="button"
						aria-label="Select Gran Canaria, ranked third"
						onclick={() => activate('lpa')}
						onkeydown={(e) => onKeydown(e, 'lpa')}
					>
						<path
							class="island-shape"
							d="M514 277 C535 255 573 254 596 276 C620 299 616 338 592 358 C566 379 527 369 509 342 C496 321 498 294 514 277 Z"
						/>
						<circle class="rank-badge" cx="505" cy="267" r="15" /><text
							class="island-number"
							x="505"
							y="267">3</text
						><text class="island-name" x="560" y="404">Gran Canaria</text>
						<circle class="base-dot" cx="576" cy="272" r="7" /><text
							class="base-label"
							x="587"
							y="268">La Cícer</text
						>
					</g>
					<g
						class="island-node"
						class:selected={selectedId === 'fue'}
						data-id="fue"
						tabindex="0"
						role="button"
						aria-label="Select Fuerteventura, ranked first"
						aria-pressed={selectedId === 'fue'}
						onclick={() => activate('fue')}
						onkeydown={(e) => onKeydown(e, 'fue')}
					>
						<path
							class="island-shape"
							d="M730 258 C748 232 771 221 787 198 C799 181 813 188 817 207 C821 228 809 244 815 262 C822 284 847 297 842 320 C837 342 811 350 802 374 C793 397 780 423 759 421 C740 418 741 395 750 376 C759 357 756 341 740 327 C720 309 713 282 730 258 Z"
						/>
						<circle class="rank-badge" cx="722" cy="244" r="16" /><text
							class="island-number"
							x="722"
							y="244">1</text
						><text class="island-name" x="786" y="463">Fuerteventura</text>
						<circle class="base-dot" cx="790" cy="209" r="7" /><text
							class="base-label"
							x="801"
							y="205">Corralejo</text
						>
						<circle class="base-dot" cx="774" cy="226" r="7" /><text
							class="base-label"
							x="735"
							y="218">Lajares</text
						>
					</g>
					<g
						class="island-node"
						class:selected={selectedId === 'ace'}
						data-id="ace"
						tabindex="0"
						role="button"
						aria-label="Select Lanzarote, ranked second"
						onclick={() => activate('ace')}
						onkeydown={(e) => onKeydown(e, 'ace')}
					>
						<path
							class="island-shape"
							d="M866 105 C879 83 903 70 920 82 C934 92 925 113 917 128 C908 145 916 164 906 182 C895 201 872 204 858 190 C847 178 856 159 852 144 C847 128 856 118 866 105 Z"
						/>
						<circle class="rank-badge" cx="852" cy="96" r="16" /><text
							class="island-number"
							x="852"
							y="96">2</text
						><text class="island-name" x="892" y="227">Lanzarote</text>
						<circle class="base-dot" cx="861" cy="157" r="7" /><text
							class="base-label"
							x="817"
							y="174">Famara</text
						>
					</g>
					<g
						class="island-node"
						class:selected={selectedId === 'gra'}
						data-id="gra"
						tabindex="0"
						role="button"
						aria-label="Select La Graciosa, ranked eighth"
						onclick={() => activate('gra')}
						onkeydown={(e) => onKeydown(e, 'gra')}
					>
						<path
							class="island-shape"
							d="M920 39 C933 30 952 33 959 44 C965 54 953 65 941 70 C928 75 914 68 911 58 C908 50 913 44 920 39 Z"
						/>
						<circle class="rank-badge" cx="906" cy="37" r="14" /><text
							class="island-number"
							x="906"
							y="37">8</text
						><text class="island-name" x="941" y="94">La Graciosa</text>
					</g>
				</svg>
				<div class="map-key">
					<span><i class="dot" style="background:#ffd166;border:1px solid #075965"></i>selected island</span>
					<span><i class="dot" style="background:#ef765f"></i>suggested base</span>
				</div>
			</div>
			<aside class="map-side" aria-live="polite">
				{#if selected}
					<p class="eyebrow">#{selected.rank} of 8 · activity score {selected.score}</p>
					<h3>{selected.name}</h3>
					<p class="summary">{selected.summary}</p>
					<div class="map-tags">
						{#each selected.tags as tag (tag)}
							<span class="map-tag">{tag}</span>
						{/each}
					</div>
					<div class="map-facts">
						<div class="map-fact"><span>Best base</span><b>{selected.best}</b></div>
						<div class="map-fact"><span>Villa fit</span><b>{selected.villa}</b></div>
						<div class="map-fact"><span>February</span><b>{selected.weather}</b></div>
						<div class="map-fact"><span>Surf drive</span><b>{selected.drive}</b></div>
					</div>
				{/if}
			</aside>
		</div>
	</div>
</section>

<style>
	.map-shell {
		display: grid;
		grid-template-columns: minmax(0, 1.55fr) minmax(330px, 0.75fr);
		background: #06262b;
		border-radius: 30px;
		overflow: hidden;
		box-shadow: var(--shadow);
		min-height: 610px;
	}
	.map-side {
		padding: 30px;
		color: white;
		display: flex;
		flex-direction: column;
	}
	.map-side .eyebrow {
		color: var(--aqua);
	}
	.map-side h3 {
		font: 800 2.2rem / 1 Georgia, serif;
		margin: 0 0 10px;
	}
	.map-side .summary {
		color: #cce2df;
		margin: 0 0 18px;
	}
	.map-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 22px;
	}
	.map-tag {
		font-size: 0.74rem;
		font-weight: 800;
		border-radius: 99px;
		padding: 6px 10px;
		background: rgba(255, 255, 255, 0.1);
		color: #e9f5f3;
	}
	.map-facts {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-top: auto;
	}
	.map-fact {
		padding: 13px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 14px;
	}
	.map-fact span {
		display: block;
		color: #9ec6c2;
		font-size: 0.7rem;
		text-transform: uppercase;
		font-weight: 800;
		letter-spacing: 0.08em;
	}
	.map-fact b {
		font-size: 0.95rem;
	}
	#map {
		min-height: 610px;
		background: linear-gradient(160deg, #bfe3df 0%, #8bc8c6 100%);
		position: relative;
		overflow: hidden;
	}
	.archipelago-map {
		display: block;
		width: 100%;
		height: 610px;
	}
	.ocean-line {
		fill: none;
		stroke: rgba(255, 255, 255, 0.32);
		stroke-width: 2;
	}
	.map-caption {
		fill: #27686d;
		font-size: 13px;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}
	.island-node {
		cursor: pointer;
		outline: none;
	}
	.island-shape {
		fill: #fff8df;
		stroke: #075965;
		stroke-width: 4;
		transition: transform 0.2s, fill 0.2s, stroke 0.2s;
		transform-box: fill-box;
		transform-origin: center;
		filter: drop-shadow(0 8px 8px rgba(3, 61, 67, 0.2));
	}
	.island-node:hover .island-shape,
	.island-node:focus .island-shape,
	.island-node.selected .island-shape {
		fill: #ffd166;
		stroke: #fff;
		transform: scale(1.08);
	}
	.island-node:focus-visible .island-shape {
		stroke-width: 8;
	}
	.rank-badge {
		fill: #fffdf7;
		stroke: #075965;
		stroke-width: 3;
		pointer-events: none;
	}
	.island-node.selected .rank-badge {
		fill: #075965;
		stroke: #fff;
	}
	.island-number {
		fill: #063e47;
		font-size: 14px;
		font-weight: 900;
		text-anchor: middle;
		dominant-baseline: middle;
		pointer-events: none;
	}
	.island-node.selected .island-number {
		fill: #fff;
	}
	.island-name {
		fill: #073f47;
		font-size: 16px;
		font-weight: 900;
		text-anchor: middle;
		paint-order: stroke;
		stroke: #b9dcda;
		stroke-width: 5px;
		stroke-linejoin: round;
		pointer-events: none;
	}
	.base-dot {
		fill: #ef765f;
		stroke: #fff;
		stroke-width: 3;
		pointer-events: none;
	}
	.base-label {
		fill: #173f45;
		font-size: 11px;
		font-weight: 800;
		paint-order: stroke;
		stroke: #d7eeeb;
		stroke-width: 4px;
		stroke-linejoin: round;
		pointer-events: none;
	}
	.map-key {
		position: absolute;
		left: 18px;
		bottom: 18px;
		background: rgba(255, 253, 247, 0.94);
		padding: 9px 12px;
		border-radius: 12px;
		box-shadow: 0 5px 18px rgba(0, 0, 0, 0.12);
		font-size: 0.72rem;
		font-weight: 700;
		color: #36565b;
	}
	.map-key span {
		display: inline-flex;
		align-items: center;
		margin-right: 12px;
	}
	.dot {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-right: 6px;
	}

	@media (max-width: 960px) {
		.map-shell {
			grid-template-columns: 1fr;
			min-height: auto;
		}
		.map-side {
			min-height: 430px;
		}
		#map {
			min-height: 520px;
		}
		.archipelago-map {
			height: 520px;
		}
	}

	@media (max-width: 650px) {
		.map-side {
			padding: 22px;
		}
		.map-facts {
			grid-template-columns: 1fr;
		}
		.archipelago-map {
			height: 390px;
		}
		.island-name {
			font-size: 20px;
		}
		.base-label {
			display: none;
		}
		.map-key {
			position: static;
			margin: 12px;
		}
	}

	@media print {
		.map-shell {
			grid-template-columns: 1fr;
		}
		.map-side {
			min-height: auto;
		}
		#map {
			height: 420px;
		}
		.archipelago-map {
			height: 420px;
		}
	}
</style>
