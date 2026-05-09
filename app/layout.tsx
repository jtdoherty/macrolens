import type { Metadata } from 'next';
import { Figtree, Playfair_Display } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

// Optimized fonts via next/font — self-hosted, no extra round-trip,
// no layout shift. CSS variables exposed for use in globals.css.
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

// Root layout is intentionally minimal: html, body, ClerkProvider.
// Per-area chrome (sidebar for dashboard, centered card for auth) lives in
// route-group layouts at app/(dashboard)/layout.tsx and app/(auth)/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${figtree.variable} ${playfair.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
