import type { Metadata } from 'next';
import { Figtree, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

// Optimized fonts via next/font — self-hosted, no extra network round-trip,
// no layout shift. CSS variables exposed for use in globals.css if we ever
// switch to var(--font-figtree) instead of named families.
const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MacroLens — Revenue Intelligence',
  description: 'Revenue forecasting driven by macro signals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${playfair.variable}`}>
      <body>
        <div id="main-app" style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh', minHeight: 0, overflow: 'hidden' }}>
          <div className="app">
            <Sidebar />
            <main className="main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
