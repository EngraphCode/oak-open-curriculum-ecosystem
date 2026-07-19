import { readFileSync } from 'node:fs';
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { Lexend } from 'next/font/google';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import './globals.css';

// Oak's primary typeface. Body default is weight 400 (matches the prototype); 600/700 for
// headings and emphasis. Exposed as the --font-lexend CSS variable consumed by globals.css.
const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-lexend',
  display: 'swap',
});

// The design system's theme/motion state owner, inlined pre-paint (the kit
// docs §4 shape: a plain relative read against the app root — bundler module
// resolution mangles fs paths under Turbopack). public/oak-theme.js is a
// tracked copy of the workspace package's file; app/oak-theme-parity.test.ts
// turns any drift between the two into a red test. A raw inline <head>
// script is the only shape that cannot flash: it executes during parse,
// before first paint — next/script beforeInteractive does not block
// hydration and its external fetch can let first paint precede theme
// application (ADR-213 §3).
const oakThemeSource = readFileSync('public/oak-theme.js', 'utf8');

export const metadata: Metadata = {
  title: 'Curriculum hub — Oak National Academy',
  description: "Search Oak's free, fully sequenced curriculum: lessons, units and threads.",
};

// suppressHydrationWarning: the pre-paint script mutates <html> (data-theme /
// data-motion) before React hydrates; the escape hatch works one level deep.
export default function RootLayout({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <html lang="en-GB" className={lexend.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: oakThemeSource }} />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
