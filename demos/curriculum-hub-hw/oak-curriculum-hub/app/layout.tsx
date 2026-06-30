import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { Lexend } from 'next/font/google';
import './globals.css';

// Oak's primary typeface. Body default is weight 300; 600/700 for headings and
// emphasis. Exposed as the --font-lexend CSS variable consumed by globals.css.
const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Curriculum hub — Oak National Academy',
  description: "Search Oak's free, fully sequenced curriculum: lessons, units and threads.",
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="en-GB" className={lexend.variable}>
      <body>{children}</body>
    </html>
  );
}
