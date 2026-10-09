#!/usr/bin/env node
// Roster tooling. The roster (names + invite phrases) is secret: it lives in
// the gitignored `members.json` locally and in the `MEMBERS` Vercel env var.
//
//   npm run members:init            create members.json from the example
//   npm run members:check           validate members.json
//   npm run members:gen -- <id>     give one member a fresh random phrase
//   npm run members:gen -- --all    fresh phrases for everyone
//   npm run members:push            validate, then replace MEMBERS on Vercel
//                                   (production + preview), then redeploy
import { randomInt } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseMembers } from '../src/lib/server/members.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const FILE = `${root}members.json`;
const EXAMPLE = `${root}members.example.json`;
const WORDS = `${root}scripts/wordlist-eff-large.txt`;

const [cmd, ...args] = process.argv.slice(2);

/** @param {string} msg */
function die(msg) {
	console.error(`\n${msg}`);
	process.exit(1);
}

function readRoster() {
	if (!existsSync(FILE)) die('members.json not found. Run `npm run members:init` first.');
	try {
		return JSON.parse(readFileSync(FILE, 'utf8'));
	} catch (e) {
		return die(`members.json is not valid JSON: ${/** @type {Error} */ (e).message}`);
	}
}

/** @param {unknown} raw */
function validate(raw) {
	try {
		return parseMembers(raw);
	} catch (e) {
		return die(/** @type {Error} */ (e).message);
	}
}

function loadWords() {
	return readFileSync(WORDS, 'utf8')
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l && !l.startsWith('#'));
}

/** @param {string[]} words */
const makePhrase = (words) => `${words[randomInt(words.length)]}-${words[randomInt(words.length)]}`;

/** @param {string} name */
function flag(name) {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : undefined;
}

if (cmd === 'init') {
	if (existsSync(FILE)) die('members.json already exists; not overwriting.');
	copyFileSync(EXAMPLE, FILE);
	console.log(
		'Created members.json from the example. Edit names, then run `npm run members:gen -- --all`.'
	);
} else if (cmd === 'check') {
	const { members, warnings } = validate(readRoster());
	for (const w of warnings) console.warn(`warning: ${w}`);
	const admins = members.filter((m) => m.admin).map((m) => m.name);
	console.log(`OK: ${members.length} members, admin: ${admins.join(', ')}.`);
} else if (cmd === 'gen') {
	const raw = readRoster();
	const { members } = validate(raw);
	const all = args.includes('--all');
	const target = args.find((a) => !a.startsWith('--'));
	if (!all && !target)
		die('Usage: members:gen -- <member-id> | --all  (REPLACES existing phrases; a backup is kept)');
	if (!all && !members.some((m) => m.id === target)) die(`No member with id "${target}".`);

	const words = loadWords();
	const taken = new Set(members.map((m) => m.phrase));
	/** @type {[string, string][]} */
	const changed = [];
	for (const entry of raw) {
		const id = String(entry.id).trim().toLowerCase();
		if (!all && id !== target) continue;
		taken.delete(members.find((m) => m.id === id)?.phrase ?? '');
		let phrase = makePhrase(words);
		while (taken.has(phrase)) phrase = makePhrase(words);
		taken.add(phrase);
		entry.phrase = phrase;
		changed.push([entry.name, phrase]);
	}
	validate(raw);
	// Phrases are often chosen by hand for each person: never overwrite them without
	// a way back. One backup, replaced each time; git-ignored like members.json.
	const backup = `${FILE}.bak`;
	copyFileSync(FILE, backup);
	writeFileSync(FILE, `${JSON.stringify(raw, null, '\t')}\n`);
	console.log(`The previous file is saved as ${backup} (undo: copy it back over ${FILE}).`);
	console.log('New phrases (give these to people privately; they are also in members.json):\n');
	for (const [name, phrase] of changed) console.log(`  ${name.padEnd(24)} ${phrase}`);
	console.log('\nNext: npm run members:push, then redeploy (vercel --prod).');
} else if (cmd === 'push') {
	const raw = readRoster();
	validate(raw);
	const name = flag('--name') ?? 'MEMBERS';
	const value = JSON.stringify(raw);
	for (const target of ['production', 'preview']) {
		// Replace: remove first (ignore "not found"), then add. Value goes in via
		// stdin so it never appears in the process list or in logs.
		spawnSync('vercel', ['env', 'rm', name, target, '--yes'], { stdio: 'ignore' });
		const add = spawnSync('vercel', ['env', 'add', name, target, '--sensitive', '--force'], {
			input: value,
			encoding: 'utf8'
		});
		if (add.status !== 0) {
			die(`Failed to set ${name} for ${target}:\n${(add.stderr || add.stdout).trim()}`);
		}
		console.log(`Set ${name} for ${target}.`);
	}
	console.log('\nEnv changes only apply to new deployments. Run: vercel --prod');
} else {
	die('Usage: node scripts/members.js <init|check|gen|push>');
}
