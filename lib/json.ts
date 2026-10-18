/**
 * Parse Response JSON as an unknown object boundary.
 * Callers narrow with zod or explicit field checks.
 */
export async function readJson(response: Response): Promise<unknown> {
  return (await response.json()) as unknown;
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function errorMessage(value: unknown, fallback = 'Request failed'): string {
  const record = asRecord(value);
  const message = record['error'];
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}
