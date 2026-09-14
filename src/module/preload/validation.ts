/**
 * Client-side defensive validation for the module preload bridge.
 * Main-process validators remain authoritative.
 */

const MAX_STRING = 4096;
const MAX_URL = 2048;
const MAX_COPY = 100000;

export function assertFunction(value: unknown, name: string): asserts value is Function {
  if (typeof value !== 'function') {
    throw new TypeError(`${name} must be a function`);
  }
}

export function assertString(
  value: unknown,
  name: string,
  { min = 0, max = MAX_STRING }: { min?: number; max?: number } = {}
): string {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    throw new TypeError(
      `${name} must be a string between ${min} and ${max} characters`
    );
  }
  return value;
}

export function assertRecord(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

export function assertOpenableUrl(value: unknown): string {
  const raw = assertString(value, 'URL', { min: 1, max: MAX_URL });
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new TypeError('URL must be an absolute URL');
  }
  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'https:' && protocol !== 'http:' && protocol !== 'mailto:') {
    throw new TypeError('URL protocol is not allowed');
  }
  return parsed.toString();
}

export function assertCopyText(value: unknown): string {
  return assertString(value, 'text', { min: 0, max: MAX_COPY });
}
