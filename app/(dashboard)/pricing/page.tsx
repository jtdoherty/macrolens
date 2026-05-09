import { getCurrentUserSubscription, isActiveStatus } from '@/lib/subscription';
import Link from 'next/link';

const FEATURES = [
  'Macro-adjusted revenue forecasts for 20+ tickers',
  'Walk-forward validated models — anchor / macro / blend',
  'Per-ticker valuation bands (bear / base / bull)',
  'Macro Dashboard — 18 FRED indicators across 6 categories',
  'Filterable Screener with sector / signal / confidence',
  'Side-by-side ticker Comparison',
  'Portfolio + Watchlist (synced to your account in Phase 3)',
  'Full financial statements per ticker (5y annual + 12q quarterly)',
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const sub = await getCurrentUserSubscription();
  const alreadySubscribed = isActiveStatus(sub?.subscriptionStatus);

  return (
    <div className="pb" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="ph" style={{ background: 'transparent', border: 'none', padding: '40px 0 24px' }}>
        <h1 style={{ textAlign: 'center', fontSize: 28 }}>Subscribe to MacroLens Pro</h1>
        <p style={{ textAlign: 'center' }}>
          7-day free trial · cancel anytime · no commitment
        </p>
      </div>

      {sp.canceled && (
        <div className="badge ba2" style={{ display: 'block', textAlign: 'center', padding: '10px 16px', marginBottom: 16 }}>
          Checkout canceled — no charge made. Subscribe whenever you&apos;re ready.
        </div>
      )}
      {sp.error && (
        <div className="badge br2" style={{ display: 'block', textAlign: 'center', padding: '10px 16px', marginBottom: 16 }}>
          Something went wrong ({sp.error}). Please try again.
        </div>
      )}

      {alreadySubscribed ? (
        <div className="card cp" style={{ textAlign: 'center' }}>
          <div className="sh2" style={{ justifyContent: 'center' }}>You&apos;re subscribed</div>
          <p style={{ color: 'var(--slate)', marginBottom: 18 }}>
            Status: <strong>{sub?.subscriptionStatus}</strong>
          </p>
          <Link href="/" className="btn btnp" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Open Dashboard →
          </Link>
        </div>
      ) : (
        <div className="card cp">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 600, lineHeight: 1, marginBottom: 4 }}>
              $1<span style={{ fontSize: 16, color: 'var(--slate)', fontFamily: 'var(--font)', fontWeight: 400 }}> / month</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--slate2)' }}>(test pricing — change in Stripe Dashboard anytime)</div>
          </div>

          <div className="div"></div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURES.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink2)' }}>
                <span style={{ color: 'var(--green)', flexShrink: 0, fontWeight: 700 }}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <form action="/api/stripe/checkout" method="POST">
            <button type="submit" className="btn btnp" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
              Start 7-day free trial →
            </button>
          </form>

          <p style={{ fontSize: 11, color: 'var(--slate2)', textAlign: 'center', marginTop: 14 }}>
            You won&apos;t be charged until day 8. Cancel anytime from the customer portal.
            Powered by Stripe.
          </p>
        </div>
      )}
    </div>
  );
}
