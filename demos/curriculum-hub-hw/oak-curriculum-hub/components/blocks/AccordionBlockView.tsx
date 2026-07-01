import type { ReactElement } from 'react';

import type { AccordionBlock } from '@/lib/blocks/types';

/**
 * Renders an {@link AccordionBlock} using native `<details>`/`<summary>`, which
 * are keyboard-operable and screen-reader-announced without JavaScript (the
 * most robust WCAG-AA choice). The numbered badge is decorative (`aria-hidden`).
 * `chip` tints the accent in the styling pass (`data-chip`).
 */
export function AccordionBlockView({ block }: { block: AccordionBlock }): ReactElement {
  return (
    <div data-chip={block.chip}>
      {block.items.map((item) => (
        <details key={item.q}>
          <summary>
            {item.badge !== undefined && <span aria-hidden>{item.badge}</span>} {item.q}
          </summary>
          {item.a.map((para) => (
            <p key={para}>{para}</p>
          ))}
          {item.img !== undefined && (
            <figure>
              <div role="img" aria-label={item.img.placeholder} />
              <figcaption>{item.img.placeholder}</figcaption>
            </figure>
          )}
          {item.features !== undefined && (
            <ul>
              {item.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          )}
        </details>
      ))}
    </div>
  );
}
