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

export const metadata: Metadata = {
  title: 'Curriculum hub — Oak National Academy',
  description: "Search Oak's free, fully sequenced curriculum: lessons, units and threads.",
};

export default function RootLayout({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <html lang="en-GB" className={lexend.variable}>
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
