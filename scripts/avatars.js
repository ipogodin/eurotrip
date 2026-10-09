#!/usr/bin/env node
// Check the private avatars/ folder against the roster, before anything is uploaded.
//
//   npm run avatars:check
//
// Convention: avatars/<member-id>_1.<ext> is the member's own photo (the
// default), avatars/<member-id>_2.<ext> is the "neh, this one is better"
// replacement used by the photo prank. Prints, per member, whether both photos
// exist and are usable; plus stray files, unreadable or tiny photos, very
// wide/tall ones and identical pairs. Reads only member ids from members.json
// (never phrases).
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = `${root}avatars`;
const NAME = /^(.+)_([12])\.(jpe?g|png|webp)$/;
const MIN_SIDE = 256; // below this an avatar looks blurry even at its normal size
const GOOD_SIDE = 512; // comfortable for the large reveal view; below it is only a note
const MAX_BYTES = 10 * 1024 * 1024;
const LABEL = { 1: 'default (_1)', 2: 'prank   (_2)' };

if (!existsSync(`${root}members.json`)) {
	console.error('No members.json here (run `npm run members:init`).');
	process.exit(1);
}
/** @type {{ id: string }[]} */
const roster = JSON.parse(readFileSync(`${root}members.json`, 'utf8'));
const ids = roster.map((m) => m.id);

const files = existsSync(dir)
	? readdirSync(dir).filter(
			(f) => statSync(`${dir}/${f}`).isFile() && !f.startsWith('.') && f !== 'README.md'
		)
	: [];

/** member id -> { 1: [files], 2: [files] } @type {Map<string, Record<string, string[]>>} */
const slots = new Map();
/** @type {string[]} */
const stray = [];
for (const f of files.sort()) {
	const m = NAME.exec(f);
	if (!m || !ids.includes(m[1])) {
		stray.push(f);
		continue;
	}
	const s = slots.get(m[1]) ?? { 1: [], 2: [] };
	s[m[2]].push(f);
	slots.set(m[1], s);
}

/**
 * @param {string} file
 * @returns {Promise<{ info: string, problems: string[], notes: string[] }>}
 */
async function inspect(file) {
	/** @type {string[]} */
	const problems = [];
	/** @type {string[]} */
	const notes = [];
	const size = statSync(file).size;
	if (size > MAX_BYTES) problems.push('over 10 MB');
	try {
		const { width = 0, height = 0 } = await sharp(file).metadata();
		const short = Math.min(width, height);
		if (short < MIN_SIDE) problems.push(`too small, want ${MIN_SIDE}+ px on the short side`);
		else if (short < GOOD_SIDE)
			notes.push(`fine, but ${GOOD_SIDE}+ px is sharper in the large view`);
		const ratio = width / height;
		if (ratio < 0.6 || ratio > 1.67) {
			problems.push(`very ${ratio > 1 ? 'wide' : 'tall'}; will be cropped to a square`);
		}
		return { info: `${width}x${height}, ${(size / 1024).toFixed(0)} KB`, problems, notes };
	} catch {
		return {
			info: `${(size / 1024).toFixed(0)} KB`,
			problems: [...problems, "can't read it (HEIC? export as JPG)"],
			notes
		};
	}
}

let issues = 0;
let complete = 0;
console.log('Photos per member  (avatars/<id>_1 = default, avatars/<id>_2 = prank)\n');
for (const id of ids) {
	const s = slots.get(id) ?? { 1: [], 2: [] };
	console.log(id);
	let ok = true;
	/** @type {string[]} */
	const used = [];
	for (const n of /** @type {const} */ (['1', '2'])) {
		const label = LABEL[n];
		if (s[n].length === 0) {
			console.log(`  ✗ ${label}  missing`);
			ok = false;
		} else if (s[n].length > 1) {
			console.log(`  ✗ ${label}  more than one file: ${s[n].join(', ')}`);
			ok = false;
		} else {
			const f = s[n][0];
			used.push(`${dir}/${f}`);
			const { info, problems, notes } = await inspect(`${dir}/${f}`);
			const why = [...problems, ...notes].join('; ');
			console.log(
				`  ${problems.length ? '✗' : '✓'} ${label}  ${f}  ${info}${why ? '  <- ' + why : ''}`
			);
			if (problems.length) ok = false;
		}
	}
	if (used.length === 2) {
		const [a, b] = used.map((f) => createHash('sha256').update(readFileSync(f)).digest('hex'));
		if (a === b) {
			console.log('  ✗ both photos are the same file, so the prank would show the same picture');
			ok = false;
		}
	}
	if (ok) complete++;
	else issues++;
}

if (stray.length) {
	console.log('\nFiles that match no member (check the spelling against members.json):');
	for (const f of stray) console.log(`  ? ${f}`);
	issues += stray.length;
}
console.log(
	`\n${complete} of ${ids.length} members have both photos in good shape; ${issues} thing${issues === 1 ? '' : 's'} to fix.`
);
