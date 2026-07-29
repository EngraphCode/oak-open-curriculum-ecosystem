/** Makes tracked text comparisons independent of checkout EOL configuration. */
export function normaliseLineEndings(content: string): string {
  return content.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
}
