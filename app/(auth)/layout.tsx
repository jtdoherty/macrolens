// Auth layout: centered card on the dark gradient backdrop the friend's
// reference design uses for its auth screen. No sidebar.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(135deg, #060d1f 0%, #0f1f45 45%, #1a0d4a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid overlay matches the homepage hero aesthetic */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(59,91,219,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,91,219,.04) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
