#!/usr/bin/env node
// Check the private avatars/ folder against the roster, before anything is uploaded.
//
//   npm run avatars:check
//
// Prints which members have a photo, what's missing, files whose names don't
// match anything, and photos that are too small or very far from square.
// Reads only member ids from members.json (never phrases).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const dir = `${root}avatars`;
const EXT = /\.(jpe?g|png|webp)$/i;
const MIN_SIDE = 512;
const MAX_BYTES = 10 * 1024 * 1024;

if (!existsSync(`${root}members.json`)) {
	console.error('No members.json here (run `npm run members:init`).');
	process.exit(1);
}
/** @type {{ id: string }[]} */
const roster = JSON.parse(readFileSync(`${root}members.json`, 'utf8'));
const ids = new Set(roster.map((m) => m.id));

/** @param {string} folder @returns {string[]} */
function photos(folder) {
	if (!existsSync(folder)) return [];
	return readdirSync(folder)
		.filter((f) => statSync(`${folder}/${f}`).isFile())
		.filter((f) => !f.startsWith('.') && f !== 'README.md')
		.sort();
}

/** @param {string} file @returns {Promise<string[]>} problems (empty = fine) */
async function inspect(file) {
	const problems = [];
	if (statSync(file).size > MAX_BYTES) problems.push('over 10 MB');
	try {
		const { width = 0, height = 0 } = await sharp(file).metadata();
		if (Math.min(width, height) < MIN_SIDE)
			problems.push(`small (${width}x${height}, want ${MIN_SIDE}+)`);
		const ratio = width / height;
		if (ratio < 0.6 || ratio > 1.67)
			problems.push(
				`very ${ratio > 1 ? 'wide' : 'tall'} (${width}x${height}); will be cropped to a square`
			);
		return problems.length ? problems : [`ok ${width}x${height}`].map(() => '');
	} catch {
		return [...problems, "can't read it (HEIC? export as JPG)"];
	}
}

let issues = 0;
const mark = (/** @type {boolean} */ ok) => (ok ? '✓' : '✗');

console.log('Member photos  (avatars/<member-id>.jpg|png|webp)');
const mine = photos(dir);
const byId = new Map();
/** @type {string[]} */
const unknown = [];
for (const f of mine) {
	const m = /^(.+)\.(jpe?g|png|webp)$/i.exec(f);
	if (!m || !ids.has(m[1])) unknown.push(f);
	else byId.set(m[1], [...(byId.get(m[1]) ?? []), f]);
}
for (const id of ids) {
	const files = byId.get(id) ?? [];
	if (files.length === 0) {
		console.log(`  ✗ ${id.padEnd(12)} missing`);
		issues++;
	} else if (files.length > 1) {
		console.log(`  ✗ ${id.padEnd(12)} more than one file: ${files.join(', ')}`);
		issues++;
	} else {
		const problems = (await inspect(`${dir}/${files[0]}`)).filter(Boolean);
		console.log(
			`  ${mark(problems.length === 0)} ${id.padEnd(12)} ${files[0]}${problems.length ? '  <- ' + problems.join('; ') : ''}`
		);
		if (problems.length) issues++;
	}
}
for (const f of unknown) {
	console.log(`  ? ${f}  <- not a member id or not jpg/png/webp (expected names above)`);
	issues++;
}

console.log('\n"Neh, this one is better" photos  (avatars/pool/<number>.jpg or <member-id>.jpg)');
const pool = photos(`${dir}/pool`);
if (pool.length === 0) console.log('  (none yet)');
for (const f of pool) {
	const m = /^(.+)\.(jpe?g|png|webp)$/i.exec(f);
	const stem = m?.[1] ?? '';
	const nameOk = !!m && (/^\d+$/.test(stem) || ids.has(stem));
	const problems = nameOk
		? (await inspect(`${dir}/pool/${f}`)).filter(Boolean)
		: ['name must be a number or a member id'];
	console.log(
		`  ${mark(problems.length === 0)} ${f}${problems.length ? '  <- ' + problems.join('; ') : ''}`
	);
	if (problems.length) issues++;
}

const have = [...byId.values()].filter((v) => v.length === 1).length;
console.log(
	`\n${have} of ${ids.size} member photos found, ${pool.length} in the pool, ${issues} thing${issues === 1 ? '' : 's'} to fix.`
);
