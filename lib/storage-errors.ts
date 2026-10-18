/**
 * True when an error indicates the configured external store
 * (Supabase/HTTP/DNS/TCP) is unreachable or misconfigured at the network layer.
 */
export function isStorageUnavailable(error: unknown): boolean {
  const parts: string[] = [];

  const walk = (value: unknown, depth: number): void => {
    if (value === null || value === undefined || depth > 5) return;
    if (typeof value === 'string') {
      parts.push(value);
      return;
    }
    if (value instanceof Error) {
      parts.push(value.name, value.message);
      walk((value as Error & { cause?: unknown }).cause, depth + 1);
      return;
    }
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      for (const key of ['message', 'details', 'hint', 'code', 'error', 'cause', 'reason']) {
        if (key in record) walk(record[key], depth + 1);
      }
    }
  };

  walk(error, 0);
  const text = parts.join(' ');

  return /fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENETUNREACH|Name or service not known|getaddrinfo|socket hang up|network|UND_ERR_|Self-signed certificate|certificate/i.test(
    text
  );
}