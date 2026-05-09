'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useSidebarCollapsed, toggleSidebarCollapsed } from '@/lib/store';

const NAV = {
  Analysis: [
    { href: '/', icon: '🏠', label: 'Home' },
    { href: '/macro', icon: '📊', label: 'Macro Dashboard' },
    { href: '/screener', icon: '🔍', label: 'Screener' },
    { href: '/forecast', icon: '📈', label: 'Forecast View' },
    { href: '/comparison', icon: '⚖️', label: 'Comparison' },
  ],
  Personal: [
    { href: '/portfolio', icon: '💼', label: 'Portfolio Tracker' },
    { href: '/watchlist', icon: '⭐', label: 'Watchlist' },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSidebarCollapsed();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="sidebar-wrap">
      <button className="sb-toggle" onClick={toggleSidebarCollapsed} title="Toggle sidebar">
        <span className="arrow">‹</span>
      </button>
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="sb-brand">
          <div className="sb-logo">
            Macro<span>Lens</span>
          </div>
          <div className="sb-sub">Revenue Intelligence Platform</div>
        </div>
        <div className="sb-nav-scroll">
          {Object.entries(NAV).map(([group, items]) => (
            <div className="ng" key={group}>
              <div className="ngl">{group}</div>
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-label={item.label}
                  className={`nb${isActive(item.href) ? ' active' : ''}`}
                >
                  <span className="ni nb-icon">{item.icon}</span>
                  <span className="nb-label">{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="sb-foot">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0 12px',
              borderBottom: '1px solid rgba(255,255,255,.07)',
              marginBottom: 12,
            }}
          >
            <UserButton />
            <span className="nb-label" style={{ fontSize: 12, color: 'var(--slate)' }}>
              Account
            </span>
          </div>
          <div className="sr">
            <div className="sd"></div>
            <span className="nb-label">Simulated data feed</span>
          </div>
          <div className="st nb-label">Phase 2 · auth wired</div>
        </div>
      </aside>
    </div>
  );
}
