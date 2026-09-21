export type ImageFormat = "jpeg" | "png";

const JPEG_SOI = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function detectImageFormat(bytes: Uint8Array): ImageFormat | null {
  if (startsWith(bytes, JPEG_SOI)) return "jpeg";
  if (startsWith(bytes, PNG_SIGNATURE)) return "png";
  return null;
}

/**
 * Removes the image segments that carry camera metadata, which on a phone
 * includes GPS coordinates. Returns the input untouched if it cannot be
 * parsed, since a broken image is still an image and review catches the rest.
 */
export function stripLocationMetadata(
  bytes: Uint8Array,
  format: ImageFormat,
): Uint8Array {
  return format === "jpeg" ? stripJpeg(bytes) : stripPng(bytes);
}

function stripJpeg(bytes: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];

  for (let index = 2; index + 1 < bytes.length; ) {
    if (bytes[index] !== 0xff) return bytes;

    const marker = bytes[index + 1];

    // Start of scan: everything after this is entropy-coded image data.
    if (marker === 0xda || marker === 0xd9) {
      parts.push(bytes.subarray(index));
      return concat(parts);
    }

    // Standalone markers carry no length and must be copied as-is.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(bytes.subarray(index, index + 2));
      index += 2;
      continue;
    }

    if (index + 3 >= bytes.length) return bytes;
    const length = (bytes[index + 2] << 8) | bytes[index + 3];
    const end = index + 2 + length;

    if (length < 2 || end > bytes.length) return bytes;

    if (marker !== 0xe1) parts.push(bytes.subarray(index, end));
    index = end;
  }

  return concat(parts);
}

function stripPng(bytes: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];

  for (let index = 8; index + 8 <= bytes.length; ) {
    const length =
      (bytes[index] << 24) |
      (bytes[index + 1] << 16) |
      (bytes[index + 2] << 8) |
      bytes[index + 3];
    const type = String.fromCharCode(
      bytes[index + 4],
      bytes[index + 5],
      bytes[index + 6],
      bytes[index + 7],
    );
    const end = index + 12 + length;
    const unsigned = length < 0 ? length + 2 ** 32 : length;

    if (unsigned < 0 || end > bytes.length) return bytes;

    if (type !== "eXIf") parts.push(bytes.subarray(index, end));
    index = end;
  }

  return concat(parts);
}

function startsWith(bytes: Uint8Array, prefix: number[]): boolean {
  return prefix.every((value, index) => bytes[index] === value);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}
