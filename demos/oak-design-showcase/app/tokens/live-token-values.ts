/**
 * What every token on the page currently resolves to, read out of the
 * browser rather than computed in JavaScript.
 *
 * Shaped as an external store over the DOM, for React's
 * `useSyncExternalStore` — the same shape the kit's theme store uses over
 * its runtime, and for the same reason: the state lives outside React (here,
 * in the cascade), so React needs a subscription rather than an effect that
 * pushes values into state.
 *
 * TWO READS, BECAUSE THEY ANSWER DIFFERENT QUESTIONS. A custom property's
 * computed value is the token stream after `var()` substitution, so
 * `--text-primary` reads back as its `light-dark(…)` expression rather than
 * as a colour. The standard property that CONSUMES it reports a used value,
 * so colour, shadow and filter specimens are read from the painted property
 * and show what the browser actually paints — with the expression kept
 * beside it, which is how a `color-mix()` or `calc()` token shows both as
 * written and as applied.
 *
 * RE-READING IS EVENT-DRIVEN, NEVER TIMED. Three things change what a token
 * resolves to, and each is watched at its cause:
 *
 * - A stylesheet joining, leaving, or changing in the cascade: a link
 *   added anywhere in the document (React places non-`precedence` links
 *   in the body), its own `load` if it arrived still in flight, and the
 *   binder retiring an adopted sheet in place (`disabled`).
 * - A theme choice writing `data-theme` on the root, as does the runtime's
 *   automatic response to an OS contrast request.
 * - An OS colour-scheme change, which moves every `light-dark()` with no DOM
 *   trace at all, so the media query itself is the event.
 *
 * BUT THE CAUSE IS NOT THE MOMENT TO READ, and that distinction is the
 * whole of what this module got wrong first time round. A `<head>` mutation
 * fires when the link is APPENDED, which is before its styles are in the
 * cascade — so reading there returned the outgoing identity's values, and
 * the page sat with correctly re-painted swatches beside stale numbers.
 * Since what is printed is what the browser PAINTS, the moment to read it is
 * the frame in which it paints: every cause schedules a read on the next
 * animation frame. That is a rendering-lifecycle callback, not a settle
 * timeout — no duration is guessed, nothing is tuned to one machine's speed,
 * and several causes landing together coalesce into a single pass over the
 * rows instead of one pass each.
 *
 * (Measured, not assumed: a `load` listener on the window never sees a
 * stylesheet link's load event, capture phase included.)
 */
import { createFrameScheduler } from './frame-scheduler';

/** One token's current value. */
export interface LiveValue {
  /** What the browser paints: the used value where a painted property
   *  resolves one, the custom property's own value otherwise. */
  readonly value: string;
  /** The custom property as computed — the expression, for the tokens whose
   *  value is a function rather than a literal. */
  readonly expression: string;
}

export type LiveValues = ReadonlyMap<string, LiveValue>;

export interface LiveTokenValueStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): LiveValues;
  /** No values on the server: the whole point is that they come from a
   *  browser. Rows fall back to the value the kit declares. */
  getServerSnapshot(): LiveValues;
}

const NO_VALUES: LiveValues = new Map();

/**
 * One pass over every rendered row, so the whole table costs a single style
 * flush instead of one per token. Rows carry their token name; the specimen
 * inside carries the painted property to read back, when there is one.
 */
/** One row's reading. Styles are resolved through the row's OWN window,
 *  never the ambient one, which keeps the reader correct for an element
 *  living in a document other than this script's. */
function readRow(row: HTMLElement, view: Window): LiveValue {
  const name = row.dataset['token'] ?? '';
  const expression = view.getComputedStyle(row).getPropertyValue(name).trim();
  const paint = row.querySelector<HTMLElement>('[data-resolve]');
  const property = paint?.dataset['resolve'];
  const resolved =
    paint === null || property === undefined
      ? ''
      : view.getComputedStyle(paint).getPropertyValue(property).trim();
  return { value: resolved === '' ? expression : resolved, expression };
}

export function readTokenValues(scope: ParentNode): LiveValues {
  const values = new Map<string, LiveValue>();
  for (const row of scope.querySelectorAll<HTMLElement>('[data-token]')) {
    const name = row.dataset['token'];
    const view = row.ownerDocument.defaultView;
    // An empty attribute is a MISSING name, not the name of a token: the
    // dataset reports '' rather than undefined for `data-token=""`, and
    // letting that through would put an unnamed entry in the map.
    if (name !== undefined && name !== '' && view !== null) {
      values.set(name, readRow(row, view));
    }
  }
  return values;
}

/** Narrowed by node name rather than by `instanceof`, so a document from
 *  another realm still narrows correctly. */
function isLinkElement(node: Node): node is HTMLLinkElement {
  return node.nodeName === 'LINK';
}

/**
 * A stylesheet link, whether or not it looks loaded.
 *
 * The readiness is deliberately NOT tested. `link.sheet` is non-null the
 * instant the element is appended — measured in Chromium, where the object
 * exists roughly 135ms before the `load` that actually puts the rules in the
 * cascade — so treating a non-null `sheet` as "already applied" skips the
 * listener on exactly the sheet that is about to change everything. A `load`
 * listener on a genuinely-loaded link simply never fires, and `once` clears
 * it either way, so attaching unconditionally costs nothing and cannot be
 * wrong.
 */
function stylesheetLink(node: Node): HTMLLinkElement | null {
  return isLinkElement(node) && node.rel === 'stylesheet' ? node : null;
}

/** Watch everything that can change what a token resolves to, and report
 *  each occurrence to `onCause`. Returns the teardown; nothing here polls. */
function observe(document: Document, onCause: () => void): () => void {
  // Existing links first: server-rendered stylesheet links (which React
  // places in the BODY unless given a `precedence` prop) already exist
  // when this subscription starts, and hydration can win their load race —
  // an immediate read would then record unbound or outgoing used values
  // with no later event to correct them. A `load` listener on a
  // genuinely-loaded link simply never fires (see stylesheetLink above),
  // so attaching to every current link costs nothing and cannot be wrong.
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    link.addEventListener('load', onCause, { once: true });
  }

  // Document-wide, not head-only, for the same body-placement reason; the
  // attribute legs catch the binder retiring an adopted sheet in place
  // (disabled) and any href re-point. Every cause coalesces into one read
  // per painted frame downstream, so breadth here is not churn.
  const linkObserver = new MutationObserver((records) => {
    onCause();
    for (const record of records) {
      for (const node of record.addedNodes) {
        // The mutation says a sheet was ASKED for; the load says it arrived.
        // Without this the read chases an identity that is not in the
        // cascade yet, and the page shows re-painted swatches beside stale
        // numbers.
        stylesheetLink(node)?.addEventListener('load', onCause, { once: true });
      }
    }
  });
  linkObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'href', 'data-theme', 'data-motion'],
  });

  const scheme = document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
  scheme?.addEventListener('change', onCause);

  return () => {
    linkObserver.disconnect();
    scheme?.removeEventListener('change', onCause);
  };
}

function liveValuesEqual(a: LiveValues, b: LiveValues): boolean {
  if (a === b) {
    return true;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (const [name, value] of a) {
    const other = b.get(name);
    if (other?.value !== value.value || other?.expression !== value.expression) {
      return false;
    }
  }
  return true;
}

export function createLiveTokenValueStore(
  resolveDocument: () => Document | null,
): LiveTokenValueStore {
  const listeners = new Set<() => void>();
  let snapshot: LiveValues = NO_VALUES;

  const reread = (): void => {
    const document = resolveDocument();
    const next = document === null ? NO_VALUES : readTokenValues(document);
    // Snapshot IDENTITY is the render gate: useSyncExternalStore re-renders
    // on object change, and the document-wide observer makes unrelated DOM
    // mutations common causes — an equal recompute keeps the SAME object so
    // the observe→read cycle is render-free by construction, never by the
    // read happening to be textually stable.
    if (!liveValuesEqual(snapshot, next)) {
      snapshot = next;
    }
    for (const listener of listeners) {
      listener();
    }
  };
  const scheduler = createFrameScheduler(resolveDocument, reread);

  return {
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      const document = resolveDocument();
      const stop = document === null ? null : observe(document, scheduler.schedule);
      // The opening read is immediate: the rows are already painted by the
      // time React subscribes, so there is nothing to wait a frame for.
      reread();
      return () => {
        listeners.delete(listener);
        stop?.();
        scheduler.cancel();
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => NO_VALUES,
  };
}

/** The page-wide store over the real document. */
export const liveTokenValues: LiveTokenValueStore = createLiveTokenValueStore(
  () => globalThis.document ?? null,
);
