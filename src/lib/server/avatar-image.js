import sharp from 'sharp';

/** Avatars are stored and served as 256 px squares (shown at most ~130 px, 2x sharp). */
export const AVATAR_PX = 256;

/**
 * Photo -> a small square WebP: honours the photo's own rotation, crops from
 * the centre. Used by the upload script and by local development.
 * @param {string | Buffer} input  a file path or the bytes
 * @returns {Promise<Buffer>}
 */
export function processAvatar(input) {
	return sharp(input)
		.rotate()
		.resize(AVATAR_PX, AVATAR_PX, { fit: 'cover', position: 'centre' })
		.webp({ quality: 82 })
		.toBuffer();
}
