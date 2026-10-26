import { randomBytes } from 'node:crypto';

/**
 * RFC 9562 UUIDv7 using the OS CSPRNG (`crypto.randomBytes`).
 * Prefer this over `randomUUID()` (v4) for new identifiers.
 */
export function uuidv7(now = Date.now()): string {
  const bytes = randomBytes(16);

  // 48-bit big-endian Unix timestamp in milliseconds
  let ts = now;
  for (let i = 5; i >= 0; i -= 1) {
    bytes.writeUInt8(ts & 0xff, i);
    ts = Math.floor(ts / 256);
  }

  // Version 7 and RFC 4122 variant bits
  const version = bytes.readUInt8(6);
  const variant = bytes.readUInt8(8);
  bytes.writeUInt8((version & 0x0f) | 0x70, 6);
  bytes.writeUInt8((variant & 0x3f) | 0x80, 8);

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
