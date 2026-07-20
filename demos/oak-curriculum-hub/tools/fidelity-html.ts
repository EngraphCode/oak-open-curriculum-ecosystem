/** Escape a data-carried string for safe embedding in HTML text or attributes. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Resolve a demo-dir-relative evidence path from the report directory
 *  (demo-evidence/fidelity-report/ → the demo root is two levels up). */
export function fromReportDir(demoRelativePath: string): string {
  return `../../${demoRelativePath}`;
}
