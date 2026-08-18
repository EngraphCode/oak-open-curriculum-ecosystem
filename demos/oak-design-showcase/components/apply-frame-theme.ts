/**
 * Apply a stage-owned theme to a framed document's root, composing with the
 * runtime's automatic behaviours. Extracted from the switchboard's
 * useFrameTheme at its second consumer (the colour-matrix cells): the
 * matrix needs exactly this composition — identity default honouring an
 * OS-level contrast request, explicit choices held against external
 * writers — without persisting any state to the shared runtime store.
 *
 * Identity default is the no-attribute state — the framed identity's own
 * polarity governs (DDR-003 dated amendment 2026-08-11) — with the kit's
 * access commitment honoured frame-locally: an OS-level request for more
 * contrast keeps high-contrast until an explicit choice is made. Callers
 * write the attribute directly rather than calling the frame runtime's
 * set()/clear(): stage state is presentation data, and a runtime write
 * would persist to the shared localStorage and leak into the whole
 * showcase. Idempotent by the early return — the DOM queues a mutation
 * record even for a same-value attribute write, so the divergence guard
 * is what terminates an observer's correction cycle.
 */
import { IDENTITY_DEFAULT } from '@oaknational/oak-design-react';
import type { OakThemeSnapshot } from '@oaknational/oak-design-react';

export function applyFrameTheme(root: HTMLElement, theme: OakThemeSnapshot): void {
  const prefersMoreContrast =
    root.ownerDocument.defaultView?.matchMedia('(prefers-contrast: more)').matches === true;
  // The identity-default face still honours an OS contrast request — the
  // automatic route, distinct from an explicit theme.
  const defaultFace = prefersMoreContrast ? 'high-contrast' : undefined;
  const target = theme === IDENTITY_DEFAULT ? defaultFace : theme;
  if (root.dataset['theme'] === target) {
    return;
  }
  if (target === undefined) {
    delete root.dataset['theme'];
  } else {
    root.dataset['theme'] = target;
  }
}
