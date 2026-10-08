// Weighting: surf 45%, sandy beach 25%, hiking 18%, family attractions 12%.
/**
 * @typedef {'surf' | 'sand' | 'hike' | 'family'} ScoreKey
 *
 * @typedef {Record<ScoreKey, number> & {
 *   id: string;
 *   rank: number;
 *   name: string;
 *   short: string;
 *   score: number;
 *   villa: string;
 *   best: string;
 *   headline: string;
 *   summary: string;
 *   surfText: string;
 *   sandText: string;
 *   bottom: string;
 *   tags: string[];
 *   weather: string;
 *   drive: string;
 *   color: string;
 * }} Island
 */

/** @type {Island[]} */
export const islands = [
	{
		id: 'fue',
		rank: 1,
		name: 'Fuerteventura',
		short: 'North coast',
		score: 90,
		surf: 44,
		sand: 25,
		hike: 11,
		family: 10,
		villa: 'High',
		best: 'Lajares / Corralejo',
		headline: 'Best total fit',
		summary:
			'The strongest overlap of mobile surf schools, sandy beaches and large-villa territory.',
		surfText: 'Multiple north-coast options; schools move with wind, swell and level.',
		sandText: 'Outstanding: dunes, Grandes Playas and sheltered El Cotillo lagoons.',
		bottom: 'Choose for the cleanest surf-first group compromise.',
		tags: ['Best match', 'School mobility', 'White sand'],
		weather: '~21°C days · sea ~19°C',
		drive: '5–20 min from north bases',
		color: '#087f8c'
	},
	{
		id: 'ace',
		rank: 2,
		name: 'Lanzarote',
		short: 'Famara / rural north',
		score: 89,
		surf: 43,
		sand: 21,
		hike: 16,
		family: 9,
		villa: 'Medium',
		best: 'Soo / Muñique',
		headline: 'Best surf + hiking',
		summary: 'Famara is the standout single sandy learning beach; volcanic sightseeing is superb.',
		surfText: 'Famara: long sandy beach with coaching for beginner through intermediate.',
		sandText: 'Excellent at Famara and resort coves; beach can be windy and current-exposed.',
		bottom: 'Choose if volcanic hiking is the tie-breaker.',
		tags: ['Famara', 'Volcanoes', 'La Graciosa'],
		weather: '~21°C days · sea 18–19°C',
		drive: '8–20 min from rural north',
		color: '#ef765f'
	},
	{
		id: 'lpa',
		rank: 3,
		name: 'Gran Canaria',
		short: 'Las Palmas',
		score: 88,
		surf: 39,
		sand: 23,
		hike: 15,
		family: 11,
		villa: 'Split',
		best: 'Las Palmas / Arucas',
		headline: 'Best urban beach break',
		summary:
			'La Cícer is an unusually convenient sandy surf base, but large villas sit away from it.',
		surfText: 'La Cícer is friendly and school-rich; expert reefs also exist nearby.',
		sandText: 'Las Canteras is superb; south-coast dunes and beaches add depth.',
		bottom: 'Excellent activities; awkward villa geography for ten.',
		tags: ['Urban surf', 'City life', 'Mountains'],
		weather: '~21°C days · sea ~19°C',
		drive: 'Walkable if in city; 40–50 min from south',
		color: '#f6bd43'
	},
	{
		id: 'tfs',
		rank: 4,
		name: 'Tenerife',
		short: 'South / southwest',
		score: 84,
		surf: 36,
		sand: 18,
		hike: 18,
		family: 12,
		villa: 'High',
		best: 'Callao Salvaje / Adeje',
		headline: 'Best family depth',
		summary:
			'The deepest attractions and hiking menu, but south surf is mainly reef rather than sand.',
		surfText: 'Reliable winter energy; Las Américas is largely reef and level-sensitive.',
		sandText: 'Many family beaches, but the best south surf and best sand rarely coincide.',
		bottom: 'Choose if family attractions rise above sandy surf.',
		tags: ['Warm south', 'Teide', 'Family leader'],
		weather: '~22°C days · sea 19–20°C',
		drive: '10–25 min from southwest villas',
		color: '#9b6bb3'
	},
	{
		id: 'spc',
		rank: 5,
		name: 'La Palma',
		short: 'West / east coasts',
		score: 63,
		surf: 24,
		sand: 11,
		hike: 18,
		family: 10,
		villa: 'Medium',
		best: 'Los Llanos / Breña Baja',
		headline: 'Hiker’s specialist',
		summary:
			'World-class landscapes and stargazing, but limited learner surf and mostly black sand.',
		surfText: 'Few schools and a more exposed, expert-skewed surf proposition.',
		sandText: 'Attractive volcanic beaches; not the broad golden-sand brief.',
		bottom: 'Brilliant hiking trip, wrong surf trip.',
		tags: ['Caldera', 'Stargazing', 'Black sand'],
		weather: 'Mild · wetter by zone',
		drive: 'Longer and condition-dependent',
		color: '#5f8b4c'
	},
	{
		id: 'gmz',
		rank: 6,
		name: 'La Gomera',
		short: 'Valle Gran Rey',
		score: 55,
		surf: 15,
		sand: 11,
		hike: 18,
		family: 11,
		villa: 'Low',
		best: 'Valle Gran Rey',
		headline: 'Forest escape',
		summary:
			'Garajonay and ravines are special; the surf-school ecosystem the group needs is absent.',
		surfText: 'Sparse, condition-dependent and not a dependable learner plan.',
		sandText: 'Small dark-sand beaches and coves rather than broad sandy surf beaches.',
		bottom: 'A hiking add-on from Tenerife, not the group base.',
		tags: ['Garajonay', 'Quiet', 'Ferry access'],
		weather: 'Mild · green highlands',
		drive: 'No reliable surf cluster',
		color: '#438e75'
	},
	{
		id: 'vde',
		rank: 7,
		name: 'El Hierro',
		short: 'La Frontera',
		score: 48,
		surf: 13,
		sand: 6,
		hike: 18,
		family: 11,
		villa: 'Low',
		best: 'La Frontera',
		headline: 'Wild and quiet',
		summary:
			'Superb diving and volcanic nature; extremely limited sand, surf teaching and large-villa choice.',
		surfText: 'Specialist reef surfing, not a beginner–intermediate group base.',
		sandText: 'Natural pools and rocky coast dominate.',
		bottom: 'Save for diving and solitude.',
		tags: ['Diving', 'Natural pools', 'Remote'],
		weather: 'Mild · highly local',
		drive: 'No practical learner network',
		color: '#516d81'
	},
	{
		id: 'gra',
		rank: 8,
		name: 'La Graciosa',
		short: 'Caleta de Sebo',
		score: 46,
		surf: 10,
		sand: 23,
		hike: 8,
		family: 5,
		villa: 'Very low',
		best: 'Day trip from Lanzarote',
		headline: 'Perfect day trip',
		summary:
			'Glorious white sand and cycling, but almost no large-villa or surf-school infrastructure.',
		surfText: 'No dependable coached surf plan for this group.',
		sandText: 'Beautiful white and golden beaches; some north beaches have dangerous currents.',
		bottom: 'Visit from Lanzarote rather than base here.',
		tags: ['White sand', 'No paved roads', 'Cycling'],
		weather: 'Dry and exposed',
		drive: 'Walk, bike or 4×4 taxi',
		color: '#c48754'
	}
];
