/**
 * Candidate villas people vote on. EDIT THIS FILE (or ask the agent to fill
 * it from listing URLs). Photos live in `static/villas/<id>/` and are made
 * with `npm run villas:photos` (see scripts/photos.js).
 *
 * @typedef {{
 *   id: string,
 *   name: string,
 *   town: string,
 *   island: string,
 *   coords: [number, number],
 *   url: string,
 *   source: 'airbnb' | 'booking' | 'vrbo' | 'other',
 *   price: { total: number, currency: 'EUR' | 'USD' | 'GBP', nights: number },
 *   bedrooms: number,
 *   bathrooms: number,
 *   sleeps: number,
 *   photos: { src: string, thumb: string, width: number, height: number }[],
 *   highlights: string[],
 *   blurb: string,
 *   placeholder?: boolean
 * }} Villa
 */

/** @type {Villa[]} */
export const villas = [
	{
		id: 'placeholder-1',
		name: '[placeholder] Casa Lajares',
		town: 'Lajares',
		island: 'Fuerteventura',
		coords: [28.6861, -13.9381],
		url: 'https://example.com/listing-1',
		source: 'other',
		price: { total: 7200, currency: 'EUR', nights: 9 },
		bedrooms: 5,
		bathrooms: 4,
		sleeps: 10,
		photos: [],
		highlights: ['Private pool', 'Surf-school pickup', '10 min to the beach'],
		blurb: 'Replace me with a real listing. Placeholder data so the screens can be built.',
		placeholder: true
	},
	{
		id: 'placeholder-2',
		name: '[placeholder] Villa Corralejo',
		town: 'Corralejo',
		island: 'Fuerteventura',
		coords: [28.7285, -13.8666],
		url: 'https://example.com/listing-2',
		source: 'other',
		price: { total: 8400, currency: 'EUR', nights: 9 },
		bedrooms: 5,
		bathrooms: 5,
		sleeps: 12,
		photos: [],
		highlights: ['Heated pool', 'Walk to town', 'BBQ terrace'],
		blurb: 'Replace me with a real listing.',
		placeholder: true
	},
	{
		id: 'placeholder-3',
		name: '[placeholder] Finca El Cotillo',
		town: 'El Cotillo',
		island: 'Fuerteventura',
		coords: [28.6869, -14.0148],
		url: 'https://example.com/listing-3',
		source: 'other',
		price: { total: 6900, currency: 'EUR', nights: 9 },
		bedrooms: 4,
		bathrooms: 3,
		sleeps: 9,
		photos: [],
		highlights: ['Ocean view', 'Quiet lagoon beaches', 'Garden'],
		blurb: 'Replace me with a real listing.',
		placeholder: true
	},
	{
		id: 'placeholder-4',
		name: '[placeholder] Villa Majanicho',
		town: 'La Oliva',
		island: 'Fuerteventura',
		coords: [28.6097, -13.9293],
		url: 'https://example.com/listing-4',
		source: 'other',
		price: { total: 7800, currency: 'EUR', nights: 9 },
		bedrooms: 6,
		bathrooms: 4,
		sleeps: 12,
		photos: [],
		highlights: ['Pool + games room', 'Kid-friendly', 'Central'],
		blurb: 'Replace me with a real listing.',
		placeholder: true
	},
	{
		id: 'placeholder-5',
		name: '[placeholder] Casa Famara',
		town: 'Famara',
		island: 'Lanzarote',
		coords: [29.1126, -13.5633],
		url: 'https://example.com/listing-5',
		source: 'other',
		price: { total: 7000, currency: 'EUR', nights: 9 },
		bedrooms: 5,
		bathrooms: 3,
		sleeps: 10,
		photos: [],
		highlights: ['Steps from the surf', 'Cliff views', 'Rooftop'],
		blurb: 'Replace me with a real listing.',
		placeholder: true
	},
	{
		id: 'placeholder-6',
		name: '[placeholder] Villa Costa Teguise',
		town: 'Costa Teguise',
		island: 'Lanzarote',
		coords: [28.9985, -13.4974],
		url: 'https://example.com/listing-6',
		source: 'other',
		price: { total: 8800, currency: 'EUR', nights: 9 },
		bedrooms: 6,
		bathrooms: 5,
		sleeps: 12,
		photos: [],
		highlights: ['Pool', 'Near sandy beaches', 'Resort amenities'],
		blurb: 'Replace me with a real listing.',
		placeholder: true
	}
];

/**
 * @param {string} id
 * @returns {Villa | undefined}
 */
export function findVilla(id) {
	return villas.find((v) => v.id === id);
}
