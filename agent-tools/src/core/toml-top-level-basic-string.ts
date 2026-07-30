import { parse } from 'smol-toml';

/**
 * Reads decoded top-level TOML basic-string values from one parsed document.
 */
export type TopLevelTomlBasicStringReader = (key: string) => string | null;

/**
 * Parse a TOML document once and create a top-level basic-string reader.
 *
 * Parsing errors intentionally propagate so each consumer can apply the error
 * boundary appropriate to its context. Runtime configuration resolution may
 * fail fast, while validators can convert the error into a file-scoped issue.
 *
 * @param content - The complete TOML document.
 * @returns A reader for decoded top-level string values.
 */
export function createTopLevelTomlBasicStringReader(
  content: string,
): TopLevelTomlBasicStringReader {
  const document = parse(content);
  return (key: string): string | null => {
    const value = document[key];
    return typeof value === 'string' ? value : null;
  };
}
