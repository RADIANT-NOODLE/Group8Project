/**
 * The one rule for every image upload in VALORA: JPEG, PNG or WebP only.
 *
 * A file input's `accept` is only a hint (the picker can be switched to "All
 * files") and `file.type` comes from the file's extension, so a video renamed
 * to clip.jpg would pass both. This reads the file's first bytes instead,
 * the same check the backend applies to property photos.
 */

/** For `<input type="file" accept=...>`: narrows what the picker offers. */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function matches(bytes, signature, offset = 0) {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

function isImageSignature(bytes) {
  return (
    matches(bytes, [0xff, 0xd8, 0xff]) || // JPEG
    matches(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) || // PNG
    // WebP. WAV audio and AVI video are RIFF files too, so the type must match.
    (matches(bytes, RIFF) && matches(bytes, WEBP, 8))
  );
}

function formatSize(bytes) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/**
 * Returns a message saying why the file can't be used, or "" when it is a real
 * JPEG, PNG or WebP image within the size limit.
 */
export async function imageFileProblem(file, { maxBytes = MAX_IMAGE_BYTES } = {}) {
  const name = file?.name || 'This file';
  const notAnImage = `${name}: only JPEG, PNG or WebP images are allowed.`;

  if (!file) return notAnImage;

  let bytes;
  try {
    bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  } catch {
    return `${name}: the file could not be read.`;
  }

  if (!isImageSignature(bytes)) return notAnImage;
  if (file.size > maxBytes) return `${name}: images can be at most ${formatSize(maxBytes)}.`;
  return '';
}
