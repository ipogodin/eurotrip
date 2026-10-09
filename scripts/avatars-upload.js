#!/usr/bin/env node
// Put the member photos where the live site can serve them, privately.
//
//   npm run avatars:upload -- --dry-run   # process and report, write nothing
//   npm run avatars:upload                # write to the Redis in .env.local
//
// Each avatars/<id>_<n>.<ext> becomes a 256 px WebP stored in Redis under
// avatar:img:<id>:<n>, plus how many versions each member has. Photos are only
// ever served by the app to signed-in members. It does NOT touch which version
// anyone is currently on (so re-running never undoes the photo prank).
// Run `npm run avatars:check` first. Credentials are read from .env.local and
// never printed.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { processAvatar } from '../src/lib/server/avatar-image.js';
import { createUpstashStore } from '../src/lib/server/store/upstash.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const dryRun = process.argv.includes('--dry-run');
const FILE = /^(.+)_(\d+)\.(jpe?g|png|webp)$/i;

/** @type {{ id: string }[]} */
const roster = JSON.parse(readFileSync(`${root}members.json`, 'utf8'));
const ids = roster.map((m) => m.id);

/** @type {Map<string, Map<number, string>>} */
const found = new Map();
for (const f of existsSync(`${root}avatars`) ? readdirSync(`${root}avatars`) : []) {
	const m = FILE.exec(f);
	if (!m || !ids.includes(m[1])) continue;
	const byVersion = found.get(m[1]) ?? new Map();
	byVersion.set(Number(m[2]), f);
	found.set(m[1], byVersion);
}

/** @type {{ id: string, count: number, images: { version: number, base64: string, kb: number }[] }[]} */
const plan = [];
for (const id of ids) {
	const byVersion = found.get(id) ?? new Map();
	let count = 0;
	while (byVersion.has(count + 1)) count++;
	if (count === 0) {
		console.error(`✗ ${id}: no ${id}_1 photo. Run npm run avatars:check.`);
		process.exit(1);
	}
	/** @type {{ version: number, base64: string, kb: number }[]} */
	const images = [];
	for (let version = 1; version <= count; version++) {
		const bytes = await processAvatar(`${root}avatars/${byVersion.get(version)}`);
		images.push({ version, base64: bytes.toString('base64'), kb: Math.round(bytes.length / 1024) });
	}
	plan.push({ id, count, images });
}

const total = plan.reduce((n, p) => n + p.images.length, 0);
const kb = plan.reduce((n, p) => n + p.images.reduce((s, i) => s + i.kb, 0), 0);
for (const p of plan) {
	console.log(
		`  ${p.id.padEnd(10)} ${p.count} photo${p.count === 1 ? '' : 's'}  (${p.images.map((i) => i.kb + ' KB').join(', ')})`
	);
}
console.log(`\n${total} images, ${kb} KB in total.`);
if (dryRun) {
	console.log('Dry run: nothing was written.');
	process.exit(0);
}

/** @param {string} file */
function readEnv(file) {
	/** @type {Record<string, string>} */
	const env = {};
	if (!existsSync(file)) return env;
	for (const line of readFileSync(file, 'utf8').split('\n')) {
		const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
		if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
	}
	return env;
}
const env = { ...readEnv(`${root}.env.local`), ...process.env };
const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
	console.error('No Redis credentials found in .env.local (run `vercel env pull .env.local`).');
	process.exit(1);
}
const store = createUpstashStore({ url, token });
for (const p of plan) {
	for (const image of p.images) await store.setAvatarImage(p.id, image.version, image.base64);
	await store.setAvatarCount(p.id, p.count);
}
console.log(
	'Uploaded to the live Redis (private). Members who are not on a version yet start on photo 1.'
);
