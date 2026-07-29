import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Design showcase — Oak Open Curriculum Design System',
  description:
    'Live one-page showcase of the Oak Open Curriculum Design System: tokens, components, identity and theme switching.',
};

// No font pipeline here by design: the kit self-hosts Lexend through its
// own @font-face (framework-invariant trunk, ADR-213) — a package consumer
// adds nothing. The theme bootstrap (inline pre-paint script) arrives with
// the switcher in the page slice; machinery and affordance travel together.
export default function RootLayout({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
