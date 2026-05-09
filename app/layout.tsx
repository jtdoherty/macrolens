import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'MacroLens — Revenue Intelligence',
  description: 'Revenue forecasting driven by macro signals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
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
