import { parsePhrases } from '$lib/avatar.js';
import raw from './avatar-phrases.txt?raw';

/** The phrases from `avatar-phrases.txt` (edit that file, not this one). */
export const AVATAR_PHRASES = parsePhrases(raw);
