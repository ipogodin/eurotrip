#!/usr/bin/env node
// Turn source photos into web-ready files for one villa.
//
//   npm run villas:photos -- <villa-id> <photo> [<photo> ...] [--out <dir>]
//
// Writes <out>/<villa-id>/<n>.webp (max 1600 px wide) and <n>-thumb.webp
// (480 px) and prints the `photos` array to paste into src/lib/config/villas.js.
// The first photo is the cover. Default <out> is static/villas.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? args.splice(outIdx, 2)[1] : `${root}static/villas`;
const [id, ...files] = args;

if (!id || !/^[a-z0-9-]+$/.test(id) || files.length === 0) {
	console.error('Usage: npm run villas:photos -- <villa-id> <photo> [<photo> ...] [--out <dir>]');
	process.exit(1);
}

const dir = `${out}/${id}`;
mkdirSync(dir, { recursive: true });

const photos = [];
for (const [i, file] of files.entries()) {
	const n = i + 1;
	const full = await sharp(file)
		.rotate() // honor EXIF orientation
		.resize({ width: 1600, withoutEnlargement: true })
		.webp({ quality: 74 })
		.toFile(`${dir}/${n}.webp`);
	await sharp(file)
		.rotate()
		.resize({ width: 480, withoutEnlargement: true })
		.webp({ quality: 70 })
		.toFile(`${dir}/${n}-thumb.webp`);
	photos.push({
		src: `/villas/${id}/${n}.webp`,
		thumb: `/villas/${id}/${n}-thumb.webp`,
		width: full.width,
		height: full.height
	});
	console.error(
		`${file} -> ${dir}/${n}.webp (${full.width}x${full.height}, ${Math.round(full.size / 1024)} KB)`
	);
}
console.log(`photos: ${JSON.stringify(photos, null, '\t')},`);
