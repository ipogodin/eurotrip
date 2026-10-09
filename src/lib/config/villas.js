/**
 * Candidate villas people vote on: the south-west listings from the group's Airbnb
 * wishlist "Tenerife, Spain 2027" (pulled 2026-10-08; 13 originally, 5 outside the
 * south-west were dropped by the user before launch).
 *
 * `price` is what Airbnb showed for each listing's own saved `dates`
 * (9 nights), not a quote for the final trip dates. `sleeps` is Airbnb's
 * guest maximum (children 2-12 count, babies under 2 don't).
 *
 * EDIT THIS FILE (or ask the agent to fill it from listing URLs). Photos live in `static/villas/<id>/` and are made
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
 *   dates?: { start: string, end: string },
 *   rating?: number,
 *   placeholder?: boolean
 * }} Villa
 */

/** @type {Villa[]} */
export const villas = [
	{
		id: 'h20-costa-adeje',
		name: 'H20 Villa',
		town: 'Costa Adeje',
		island: 'Tenerife',
		coords: [28.09183, -16.73706],
		url: 'https://www.airbnb.com/rooms/892712134771048307',
		source: 'airbnb',
		price: { total: 7979, currency: 'USD', nights: 9 },
		dates: { start: '2027-02-25', end: '2027-03-06' },
		rating: 4.84,
		bedrooms: 5,
		bathrooms: 4,
		sleeps: 10,
		photos: [
			{
				src: '/villas/h20-costa-adeje/1.webp',
				thumb: '/villas/h20-costa-adeje/1-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/h20-costa-adeje/2.webp',
				thumb: '/villas/h20-costa-adeje/2-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/h20-costa-adeje/3.webp',
				thumb: '/villas/h20-costa-adeje/3-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/h20-costa-adeje/4.webp',
				thumb: '/villas/h20-costa-adeje/4-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/h20-costa-adeje/5.webp',
				thumb: '/villas/h20-costa-adeje/5-thumb.webp',
				width: 1600,
				height: 2400
			},
			{
				src: '/villas/h20-costa-adeje/6.webp',
				thumb: '/villas/h20-costa-adeje/6-thumb.webp',
				width: 1600,
				height: 1067
			}
		],
		highlights: [
			'Heated saltwater pool',
			'Sea view',
			'5 min walk to Playa del Duque',
			'Crib, high chair, baby gates'
		],
		blurb:
			'In El Duque, a 5-minute walk from Playa del Duque beach, restaurants and the Plaza del Duque shops. Air-conditioned, with a heated private saltwater pool.'
	},
	{
		id: 'duke-costa-adeje',
		name: 'Luxury Beach Villa Duke',
		town: 'Costa Adeje',
		island: 'Tenerife',
		coords: [28.0926, -16.73931],
		url: 'https://www.airbnb.com/rooms/10691713',
		source: 'airbnb',
		price: { total: 6719, currency: 'USD', nights: 9 },
		dates: { start: '2027-02-20', end: '2027-03-01' },
		rating: 4.84,
		bedrooms: 6,
		bathrooms: 5,
		sleeps: 12,
		photos: [
			{
				src: '/villas/duke-costa-adeje/1.webp',
				thumb: '/villas/duke-costa-adeje/1-thumb.webp',
				width: 1600,
				height: 900
			},
			{
				src: '/villas/duke-costa-adeje/2.webp',
				thumb: '/villas/duke-costa-adeje/2-thumb.webp',
				width: 1600,
				height: 900
			},
			{
				src: '/villas/duke-costa-adeje/3.webp',
				thumb: '/villas/duke-costa-adeje/3-thumb.webp',
				width: 1600,
				height: 899
			},
			{
				src: '/villas/duke-costa-adeje/4.webp',
				thumb: '/villas/duke-costa-adeje/4-thumb.webp',
				width: 1600,
				height: 900
			},
			{
				src: '/villas/duke-costa-adeje/5.webp',
				thumb: '/villas/duke-costa-adeje/5-thumb.webp',
				width: 1600,
				height: 900
			},
			{
				src: '/villas/duke-costa-adeje/6.webp',
				thumb: '/villas/duke-costa-adeje/6-thumb.webp',
				width: 1600,
				height: 900
			}
		],
		highlights: ['Heated private pool', 'Lift', 'Playa del Duque', 'Crib + high chair'],
		blurb:
			'The biggest villa on the list (6 bedrooms, sleeps 12) at Playa del Duque, with a heated pool, terrace and a lift. Reviews from groups of 9 praise the space and the walk to beach, shops and restaurants; the way back up is a steep hill.'
	},
	{
		id: 'sunset-adeje',
		name: 'Sunset Villa',
		town: 'Adeje',
		island: 'Tenerife',
		coords: [28.1291, -16.7733],
		url: 'https://www.airbnb.com/rooms/1705734134903929487',
		source: 'airbnb',
		price: { total: 4817, currency: 'USD', nights: 9 },
		dates: { start: '2027-02-20', end: '2027-03-01' },
		rating: 5.0,
		bedrooms: 4,
		bathrooms: 3.5,
		sleeps: 8,
		photos: [
			{
				src: '/villas/sunset-adeje/1.webp',
				thumb: '/villas/sunset-adeje/1-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/sunset-adeje/2.webp',
				thumb: '/villas/sunset-adeje/2-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/sunset-adeje/3.webp',
				thumb: '/villas/sunset-adeje/3-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/sunset-adeje/4.webp',
				thumb: '/villas/sunset-adeje/4-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/sunset-adeje/5.webp',
				thumb: '/villas/sunset-adeje/5-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/sunset-adeje/6.webp',
				thumb: '/villas/sunset-adeje/6-thumb.webp',
				width: 1600,
				height: 1067
			}
		],
		highlights: ['Private pool', 'Sunset views', 'Garden, hammocks, BBQ'],
		blurb:
			'Quiet villa built for outdoor living: private pool, garden, hammocks and a barbecue area, with sunset views from the terraces.'
	},
	{
		id: 'silvia-arona',
		name: 'Villa Silvia',
		town: 'Arona',
		island: 'Tenerife',
		coords: [28.0582, -16.7],
		url: 'https://www.airbnb.com/rooms/919221913849080262',
		source: 'airbnb',
		price: { total: 5892, currency: 'USD', nights: 9 },
		dates: { start: '2027-02-23', end: '2027-03-04' },
		rating: 4.86,
		bedrooms: 4,
		bathrooms: 4,
		sleeps: 10,
		photos: [
			{
				src: '/villas/silvia-arona/1.webp',
				thumb: '/villas/silvia-arona/1-thumb.webp',
				width: 1600,
				height: 1068
			},
			{
				src: '/villas/silvia-arona/2.webp',
				thumb: '/villas/silvia-arona/2-thumb.webp',
				width: 1600,
				height: 1068
			},
			{
				src: '/villas/silvia-arona/3.webp',
				thumb: '/villas/silvia-arona/3-thumb.webp',
				width: 1600,
				height: 1068
			},
			{
				src: '/villas/silvia-arona/4.webp',
				thumb: '/villas/silvia-arona/4-thumb.webp',
				width: 1600,
				height: 1198
			},
			{
				src: '/villas/silvia-arona/5.webp',
				thumb: '/villas/silvia-arona/5-thumb.webp',
				width: 1600,
				height: 1068
			},
			{
				src: '/villas/silvia-arona/6.webp',
				thumb: '/villas/silvia-arona/6-thumb.webp',
				width: 1600,
				height: 1068
			}
		],
		highlights: ['Heated saltwater pool (~28°C)', 'Ocean view', "Kids' playroom", 'Crib'],
		blurb:
			"Pool kept at about 28°C all year, ocean and mountain views, a children's playroom and baby gear on request."
	},
	{
		id: 'evita-costa-adeje',
		name: 'Villa Evita',
		town: 'Costa Adeje',
		island: 'Tenerife',
		coords: [28.0752, -16.7284],
		url: 'https://www.airbnb.com/rooms/1336130479861615627',
		source: 'airbnb',
		price: { total: 8017, currency: 'USD', nights: 9 },
		dates: { start: '2027-02-13', end: '2027-02-22' },
		rating: 5.0,
		bedrooms: 4,
		bathrooms: 4,
		sleeps: 8,
		photos: [
			{
				src: '/villas/evita-costa-adeje/1.webp',
				thumb: '/villas/evita-costa-adeje/1-thumb.webp',
				width: 1600,
				height: 1200
			},
			{
				src: '/villas/evita-costa-adeje/2.webp',
				thumb: '/villas/evita-costa-adeje/2-thumb.webp',
				width: 1600,
				height: 1200
			},
			{
				src: '/villas/evita-costa-adeje/3.webp',
				thumb: '/villas/evita-costa-adeje/3-thumb.webp',
				width: 1600,
				height: 1200
			},
			{
				src: '/villas/evita-costa-adeje/4.webp',
				thumb: '/villas/evita-costa-adeje/4-thumb.webp',
				width: 1600,
				height: 1200
			},
			{
				src: '/villas/evita-costa-adeje/5.webp',
				thumb: '/villas/evita-costa-adeje/5-thumb.webp',
				width: 1600,
				height: 1200
			},
			{
				src: '/villas/evita-costa-adeje/6.webp',
				thumb: '/villas/evita-costa-adeje/6-thumb.webp',
				width: 1600,
				height: 1200
			}
		],
		highlights: ['Pool + hot tub', 'Sea view', 'Minutes from Siam Park', 'Crib + high chair'],
		blurb:
			'In San Eugenio, minutes from Siam Park and Siam Mall, and a walk to the coast and calm Fañabé beach.'
	},
	{
		id: 'bonita-callao-salvaje',
		name: 'Villa Bonita Salvaje',
		town: 'Callao Salvaje',
		island: 'Tenerife',
		coords: [28.13125, -16.78317],
		url: 'https://www.airbnb.com/rooms/954211804008260476',
		source: 'airbnb',
		price: { total: 9248, currency: 'USD', nights: 9 },
		dates: { start: '2027-02-16', end: '2027-02-25' },
		rating: 4.75,
		bedrooms: 5,
		bathrooms: 4,
		sleeps: 10,
		photos: [
			{
				src: '/villas/bonita-callao-salvaje/1.webp',
				thumb: '/villas/bonita-callao-salvaje/1-thumb.webp',
				width: 1600,
				height: 1064
			},
			{
				src: '/villas/bonita-callao-salvaje/2.webp',
				thumb: '/villas/bonita-callao-salvaje/2-thumb.webp',
				width: 1600,
				height: 1064
			},
			{
				src: '/villas/bonita-callao-salvaje/3.webp',
				thumb: '/villas/bonita-callao-salvaje/3-thumb.webp',
				width: 1600,
				height: 1064
			},
			{
				src: '/villas/bonita-callao-salvaje/4.webp',
				thumb: '/villas/bonita-callao-salvaje/4-thumb.webp',
				width: 1600,
				height: 1064
			},
			{
				src: '/villas/bonita-callao-salvaje/5.webp',
				thumb: '/villas/bonita-callao-salvaje/5-thumb.webp',
				width: 1600,
				height: 1064
			},
			{
				src: '/villas/bonita-callao-salvaje/6.webp',
				thumb: '/villas/bonita-callao-salvaje/6-thumb.webp',
				width: 1600,
				height: 1064
			}
		],
		highlights: ['Private pool', 'Pool table', 'Walk to village + beach'],
		blurb:
			"Close to the centre of Callao Salvaje: restaurants, a small shopping area and the beach are a few minutes' walk away."
	},
	{
		id: 'beach-costa-adeje',
		name: 'Close to the Beach',
		town: 'Costa Adeje',
		island: 'Tenerife',
		coords: [28.091, -16.738],
		url: 'https://www.airbnb.com/rooms/1595076556156379856',
		source: 'airbnb',
		price: { total: 8065, currency: 'USD', nights: 9 },
		dates: { start: '2027-02-13', end: '2027-02-22' },
		rating: 5.0,
		bedrooms: 5,
		bathrooms: 4,
		sleeps: 10,
		photos: [
			{
				src: '/villas/beach-costa-adeje/1.webp',
				thumb: '/villas/beach-costa-adeje/1-thumb.webp',
				width: 1600,
				height: 901
			},
			{
				src: '/villas/beach-costa-adeje/2.webp',
				thumb: '/villas/beach-costa-adeje/2-thumb.webp',
				width: 1600,
				height: 901
			},
			{
				src: '/villas/beach-costa-adeje/3.webp',
				thumb: '/villas/beach-costa-adeje/3-thumb.webp',
				width: 1600,
				height: 901
			},
			{
				src: '/villas/beach-costa-adeje/4.webp',
				thumb: '/villas/beach-costa-adeje/4-thumb.webp',
				width: 1600,
				height: 901
			},
			{
				src: '/villas/beach-costa-adeje/5.webp',
				thumb: '/villas/beach-costa-adeje/5-thumb.webp',
				width: 1600,
				height: 901
			},
			{
				src: '/villas/beach-costa-adeje/6.webp',
				thumb: '/villas/beach-costa-adeje/6-thumb.webp',
				width: 1600,
				height: 901
			}
		],
		highlights: ['Pool', 'Beach access', 'Fire pit + BBQ', 'Crib'],
		blurb:
			'Spacious, well-furnished villa in an upscale part of Costa Adeje, close to the beaches. Reviewers say the pool stayed warm in winter; one mentioned small fixes the host handled quickly. Only 6 reviews so far.'
	},
	{
		id: 'rocavista-adeje',
		name: 'Rocavista Villa',
		town: 'Adeje',
		island: 'Tenerife',
		coords: [28.1352, -16.7832],
		url: 'https://www.airbnb.com/rooms/53177997',
		source: 'airbnb',
		price: { total: 6954, currency: 'USD', nights: 9 },
		dates: { start: '2027-02-13', end: '2027-02-22' },
		rating: 4.91,
		bedrooms: 4,
		bathrooms: 6,
		sleeps: 8,
		photos: [
			{
				src: '/villas/rocavista-adeje/1.webp',
				thumb: '/villas/rocavista-adeje/1-thumb.webp',
				width: 1600,
				height: 1200
			},
			{
				src: '/villas/rocavista-adeje/2.webp',
				thumb: '/villas/rocavista-adeje/2-thumb.webp',
				width: 1600,
				height: 1200
			},
			{
				src: '/villas/rocavista-adeje/3.webp',
				thumb: '/villas/rocavista-adeje/3-thumb.webp',
				width: 1600,
				height: 1200
			},
			{
				src: '/villas/rocavista-adeje/4.webp',
				thumb: '/villas/rocavista-adeje/4-thumb.webp',
				width: 1600,
				height: 1067
			},
			{
				src: '/villas/rocavista-adeje/5.webp',
				thumb: '/villas/rocavista-adeje/5-thumb.webp',
				width: 1600,
				height: 1200
			},
			{
				src: '/villas/rocavista-adeje/6.webp',
				thumb: '/villas/rocavista-adeje/6-thumb.webp',
				width: 1600,
				height: 1067
			}
		],
		highlights: [
			'Heated rooftop pool',
			'Ocean view',
			'Playground + gym',
			'10 min walk to Callao Salvaje'
		],
		blurb:
			"A 10-minute walk to Callao Salvaje's shops, restaurants and beach. Heated rooftop pool with ocean views."
	}
];

/**
 * @param {string} id
 * @returns {Villa | undefined}
 */
export function findVilla(id) {
	return villas.find((v) => v.id === id);
}
