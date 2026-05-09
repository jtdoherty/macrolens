import { Sidebar } from '@/components/Sidebar';

// Dashboard layout: sidebar + main area. Wraps every page in the (dashboard)
// route group. Auth gating happens in proxy.ts (Clerk middleware).
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="main-app"
      style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh', minHeight: 0, overflow: 'hidden' }}
    >
      <div className="app">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
