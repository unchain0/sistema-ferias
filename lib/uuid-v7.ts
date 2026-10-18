import { randomBytes } from 'node:crypto';

/**
 * RFC 9562 UUIDv7 using the OS CSPRNG (`crypto.randomBytes`).
 * Prefer this over `randomUUID()` (v4) for new identifiers.
 */
export function uuidv7(now = Date.now()): string {
  const bytes = randomBytes(16);

  // 48-bit big-endian Unix timestamp in milliseconds
  let ts = now;
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ts & 0xff;
    ts = Math.floor(ts / 256);
  }

  // Set version (7) and variant (RFC 4122)
  const byte6 = bytes[6];
  const byte8 = bytes[8];
  if (byte6 !== undefined) bytes[6] = (byte6 & 0x0f) | 0x70;
  if (byte8 !== undefined) bytes[8] = (byte8 & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}