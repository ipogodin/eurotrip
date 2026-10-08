import { describe, expect, it } from 'vitest';
import { matchPhrase, parseMembers, toPublic } from './members.js';

const raw = () => [
	{ id: 'illia', name: 'Illia Pogodin', short: 'Illia', phrase: 'copper-heron', admin: true },
	{ id: 'anna', name: 'Anna Example', phrase: 'Sample Words' }
];

describe('parseMembers', () => {
	it('normalizes and fills defaults', () => {
		const { members } = parseMembers(raw());
		expect(members[1]).toEqual({
			id: 'anna',
			name: 'Anna Example',
			short: 'Anna',
			phrase: 'sample-words',
			admin: false
		});
		expect(members[0].admin).toBe(true);
	});

	it('warns when the roster is not 8 people', () => {
		expect(parseMembers(raw()).warnings[0]).toMatch(/expected 8/);
	});

	it('requires an array', () => {
		expect(() => parseMembers({})).toThrow(/non-empty/);
		expect(() => parseMembers([])).toThrow(/non-empty/);
	});

	it('rejects duplicate ids and duplicate (normalized) phrases', () => {
		const dupId = raw();
		dupId[1].id = 'illia';
		expect(() => parseMembers(dupId)).toThrow(/duplicate id/);

		const dupPhrase = raw();
		dupPhrase[1].phrase = 'COPPER heron';
		expect(() => parseMembers(dupPhrase)).toThrow(/already used/);
	});

	it('rejects bad phrase format, bad id, missing name and no admin', () => {
		const bad = raw();
		bad[1].phrase = 'justoneword';
		expect(() => parseMembers(bad)).toThrow(/two words/);

		const badId = raw();
		badId[1].id = 'A B';
		expect(() => parseMembers(badId)).toThrow(/id must be/);

		const noName = raw();
		noName[1].name = ' ';
		expect(() => parseMembers(noName)).toThrow(/name is required/);

		const noAdmin = raw();
		noAdmin[0].admin = false;
		expect(() => parseMembers(noAdmin)).toThrow(/admin/);
	});

	it('reports every problem at once', () => {
		const bad = raw();
		bad[0].phrase = 'x';
		bad[1].name = '';
		try {
			parseMembers(bad);
			expect.unreachable();
		} catch (e) {
			expect(/** @type {Error} */ (e).message.split('\n- ').length).toBeGreaterThanOrEqual(3);
		}
	});
});

describe('matchPhrase', () => {
	const { members } = parseMembers(raw());

	it('matches regardless of case, spacing and separators', () => {
		expect(matchPhrase(members, 'copper-heron')?.id).toBe('illia');
		expect(matchPhrase(members, '  COPPER heron ')?.id).toBe('illia');
		expect(matchPhrase(members, 'sample_words')?.id).toBe('anna');
	});

	it('returns null for wrong, partial, empty or odd input', () => {
		for (const input of ['copper', 'copper-heron-x', '', undefined, null, 'nope-nope', 12345]) {
			expect(matchPhrase(members, input)).toBeNull();
		}
	});
});

describe('toPublic', () => {
	it('never includes the phrase', () => {
		const { members } = parseMembers(raw());
		const pub = toPublic(members[0]);
		expect(pub).toEqual({ id: 'illia', name: 'Illia Pogodin', short: 'Illia', isAdmin: true });
		expect(JSON.stringify(pub)).not.toContain('heron');
	});
});
