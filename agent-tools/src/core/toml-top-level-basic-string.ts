import { parse } from 'smol-toml';

/**
 * Return a decoded top-level TOML basic-string value, or `null` when absent.
 *
 * @param content - The complete TOML document.
 * @param key - The top-level key to read.
 * @returns The string value at `key`, or `null` for absent/non-string values.
 */
export function readTopLevelTomlBasicStringValue(content: string, key: string): string | null {
  const value = parse(content)[key];
  return typeof value === 'string' ? value : null;
}
