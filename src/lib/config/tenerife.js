/**
 * An approximate, hand-drawn Tenerife for the vote map: coastline points as
 * [longitude, latitude], clockwise from Punta de Teno. Deliberately a bit
 * generous (the villa positions Airbnb gives are fuzzy anyway); this is an
 * illustration, not a survey.
 */

/** Map drawing area (SVG units). Extra sea around the island leaves room for photos. */
export const VIEW = { w: 1000, h: 880 };

const LNG0 = -16.95;
const LAT0 = 28.64;
const PX_PER_LNG = 1038; // 1180 px per degree of latitude * cos(28.3°)
const PX_PER_LAT = 1180;
const PAD = { x: 75, y: 60 };

/**
 * @param {[number, number]} coords  [latitude, longitude] (as in the villa config)
 * @returns {{ x: number, y: number }}
 */
export function project([lat, lng]) {
	return { x: PAD.x + (lng - LNG0) * PX_PER_LNG, y: PAD.y + (LAT0 - lat) * PX_PER_LAT };
}

/** @type {[number, number][]} [lng, lat] */
const COAST = [
	[-16.92, 28.335], // Punta de Teno
	[-16.87, 28.375],
	[-16.8, 28.385], // Buenavista
	[-16.75, 28.38], // Garachico
	[-16.65, 28.4],
	[-16.55, 28.425], // Puerto de la Cruz
	[-16.47, 28.47],
	[-16.4, 28.51],
	[-16.35, 28.55],
	[-16.28, 28.595], // Anaga, north
	[-16.19, 28.585],
	[-16.12, 28.565], // Punta de Anaga
	[-16.17, 28.515],
	[-16.24, 28.465], // Santa Cruz
	[-16.33, 28.395],
	[-16.365, 28.34], // Candelaria
	[-16.385, 28.285],
	[-16.395, 28.225],
	[-16.415, 28.165], // Poris de Abona
	[-16.44, 28.12],
	[-16.5, 28.075],
	[-16.54, 28.03], // El Médano
	[-16.6, 28.0],
	[-16.69, 27.985], // Punta de Rasca
	[-16.73, 28.025], // Los Cristianos
	[-16.75, 28.07], // Las Américas
	[-16.775, 28.115], // Costa Adeje
	[-16.81, 28.145],
	[-16.82, 28.2],
	[-16.86, 28.25], // Los Gigantes
	[-16.9, 28.29]
];

/** The coastline projected into map units. */
export const OUTLINE = COAST.map(([lng, lat]) => project([lat, lng]));

/** Pico del Teide, drawn as a small peak for orientation. */
export const TEIDE = project([28.272, -16.642]);

/** Area names, so "south-west" means something. @type {{ text: string, at: { x: number, y: number } }[]} */
export const PLACES = [
	{ text: 'Santa Cruz', at: project([28.475, -16.2]) },
	{ text: 'Puerto de la Cruz', at: project([28.43, -16.62]) },
	{ text: 'Los Gigantes', at: project([28.255, -16.93]) }
];
