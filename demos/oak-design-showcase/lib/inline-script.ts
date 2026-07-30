/**
 * Escape JavaScript source for embedding as an inline `<script>` body. The
 * HTML parser terminates a script element at the FIRST `</script` sequence
 * regardless of JavaScript context — even inside a comment or string — so
 * un-escaped source containing that sequence truncates the inline script at
 * that point and everything after it never executes. The kit's oak-theme.js
 * contains NO such sequence today — its own header records keeping it out
 * as a standing rule — so this escape is defence-in-depth: a future kit
 * edit that breaks that discipline cannot silently truncate the runtime.
 * `<\/` is identical to `/` inside comments and string literals, which
 * covers that whole input class; the escape is NOT safe for arbitrary
 * source (a regex literal directly after `<` — contrived:
 * `x</script/.test(y)` — would be corrupted), so widen with care if the
 * input contract ever changes.
 *
 * Second in-estate copy of the kit's inline-embed contract (consuming-nextjs.md
 * §4); the hub carries the first. Cross-demo imports are architecturally
 * forbidden (ADR-041 app independence); the consolidation lane (canonical
 * owner: the kit) is Director-routed on comms event 9945f53e and carried on
 * MCP-382 — both demos delete their copies at its landing.
 */
export function escapeInlineScript(source: string): string {
  return source.replaceAll(/<\/script/gi, String.raw`<\/script`);
}
