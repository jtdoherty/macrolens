import Link from 'next/link';
import { INDS, REGIMES, INDICATOR_GROUPS, GROUP_ICONS, GROUP_COLORS, FINANCIALS } from '@/lib/data';
import { getForecasts } from '@/lib/forecast-store';
import { pct } from '@/lib/helpers';
import type { Indicator } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function MacroPage() {
  const up = INDS.filter((i) => i.s === 'Upside').length;
  const dn = INDS.filter((i) => i.s === 'Downside').length;
  const ca = INDS.filter((i) => i.s === 'Caution').length;
  const score = Math.round(((up - dn) / INDS.length) * 100);
  const scoreColor = score > 10 ? '#0d9e6e' : score < -10 ? '#e03e3e' : '#c47a0c';
  const scoreLbl = score > 10 ? 'Expansionary' : score < -10 ? 'Contractionary' : 'Mixed';
  const tickers = await getForecasts();

  return (
    <>
      <div className="ph">
        <div className="ph-inner">
          <h1>Macro Dashboard</h1>
          <p>FRED indicators, regime signals, and macro environment overview</p>
        </div>
      </div>
      <div className="pb">
        {/* HERO REGIME BAR */}
        <div
          style={{
            background: 'linear-gradient(135deg,#0f1629 0%,#1a2a4a 60%,#1e1050 100%)',
            borderRadius: 18,
            padding: '28px 32px',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(59,91,219,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(59,91,219,.06) 1px,transparent 1px)',
              backgroundSize: '32px 32px',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: -40,
              top: -40,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle,rgba(108,71,255,.18) 0%,transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,.6)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                Macro Regime · Q2 2025
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>
                Market Environment
              </div>
              <div style={{ fontSize: 14, color: 'rgba(203,213,225,.7)', marginTop: 6 }}>
                {INDS.length} indicators across {INDICATOR_GROUPS.length} macro categories
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,.07)',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 14,
                  padding: '16px 22px',
                  textAlign: 'center',
                  minWidth: 90,
                }}
              >
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 600, color: scoreColor, lineHeight: 1 }}>
                  {score > 0 ? '+' : ''}
                  {score}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,.6)', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 4 }}>
                  Regime score
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: scoreColor, marginTop: 3 }}>{scoreLbl}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                <CountRow color="#0d9e6e" count={up} label="upside" />
                <CountRow color="#c47a0c" count={ca} label="caution" />
                <CountRow color="#e03e3e" count={dn} label="downside" />
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(148,163,184,.5)' }}>Downside pressure</span>
              <span style={{ fontSize: 11, color: 'rgba(148,163,184,.5)' }}>Upside momentum</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 8, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 8,
                  background: 'linear-gradient(90deg,#e03e3e,#c47a0c,#0d9e6e)',
                  width: `${Math.round((up / INDS.length) * 100)}%`,
                  transition: 'width .6s ease',
                  minWidth: 4,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>{dn} negative</span>
              <span style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>{up} positive</span>
            </div>
          </div>
        </div>

        {/* REGIME CHIPS */}
        <div className="sh2">Current Macro Regime</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 26 }}>
          {REGIMES.map((r) => {
            const bg =
              r.cls === 'up' ? 'linear-gradient(135deg,#e6faf4,#d1fae5)'
                : r.cls === 'dn' ? 'linear-gradient(135deg,#fff0f0,#fee2e2)'
                : 'linear-gradient(135deg,#f0f3fa,#e8edf7)';
            const border = r.cls === 'up' ? '#a7f3d0' : r.cls === 'dn' ? '#fca5a5' : '#dde3f0';
            const valColor = r.cls === 'up' ? '#065f46' : r.cls === 'dn' ? '#991b1b' : '#1e2d45';
            return (
              <div
                key={r.label}
                style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 18px', cursor: 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{r.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#7a8aaa', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                    {r.label}
                  </span>
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 600, color: valColor, marginBottom: 4 }}>
                  {r.value}
                </div>
                <div style={{ fontSize: 11, color: '#7a8aaa', lineHeight: 1.5 }}>{r.sub}</div>
              </div>
            );
          })}
        </div>

        {/* TICKER HEATMAP */}
        <div className="sh2">Revenue Forecast Signal — by Ticker</div>
        <div
          style={{
            background: 'linear-gradient(135deg,#fff,var(--surface2))',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '22px 24px',
            marginBottom: 26,
            boxShadow: 'var(--sh)',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 16 }}>
            Macro-adjusted next-quarter revenue YoY — click any cell to open ticker
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {tickers.map((d) => {
              const v = d.forecast_revenue_yoy;
              const pos = v > 0.005;
              const neg = v < -0.005;
              const absV = Math.abs(v);
              const intensity = Math.min(0.9, absV * 7 + 0.15);
              const bg = pos
                ? `rgba(13,158,110,${intensity})`
                : neg
                ? `rgba(224,62,62,${intensity})`
                : 'rgba(74,87,112,.12)';
              const border = pos
                ? `rgba(13,158,110,${Math.min(1, intensity + 0.2)})`
                : neg
                ? `rgba(224,62,62,${Math.min(1, intensity + 0.2)})`
                : 'rgba(74,87,112,.2)';
              const tc = absV > 0.06 ? '#fff' : pos ? '#065f46' : neg ? '#991b1b' : '#334466';
              const fin = FINANCIALS[d.ticker];
              const shortName = fin ? fin.name.split(' ')[0] : '';
              return (
                <Link
                  key={d.ticker}
                  href={`/ticker/${d.ticker}`}
                  style={{
                    flex: 1,
                    minWidth: 110,
                    background: bg,
                    border: `1.5px solid ${border}`,
                    borderRadius: 14,
                    padding: '16px 14px',
                    textAlign: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 800, color: tc, letterSpacing: '.02em', marginBottom: 2 }}>
                    {d.ticker}
                  </div>
                  <div style={{ fontSize: 10, color: tc, opacity: 0.75, marginBottom: 8 }}>{shortName}</div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      fontFamily: "'Playfair Display',serif",
                      color: tc,
                      letterSpacing: '-.02em',
                      lineHeight: 1,
                      marginBottom: 4,
                    }}
                  >
                    {pct(v)}
                  </div>
                  <div style={{ fontSize: 10, color: tc, opacity: 0.8, fontWeight: 600 }}>{d.macro_signal_label}</div>
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 20,
                        background: 'rgba(255,255,255,.2)',
                        color: tc,
                      }}
                    >
                      {d.confidence}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* INDICATOR GROUPS */}
        <div className="sh2">Indicators by Category</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {INDICATOR_GROUPS.map((g) => (
            <IndicatorGroupCard key={g} group={g} indicators={INDS.filter((i) => i.g === g)} />
          ))}
        </div>
      </div>
    </>
  );
}

function CountRow({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'rgba(203,213,225,.8)' }}>
        {count} {label}
      </span>
    </div>
  );
}

function IndicatorGroupCard({ group, indicators }: { group: string; indicators: Indicator[] }) {
  const gColor = GROUP_COLORS[group];
  const gUp = indicators.filter((i) => i.s === 'Upside').length;
  const gDn = indicators.filter((i) => i.s === 'Downside').length;

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--sh)' }}>
      <div
        style={{
          padding: '14px 20px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg,var(--surface2),var(--white))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 28, borderRadius: 3, background: gColor, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{GROUP_ICONS[group]}</span> {group}
            </div>
            <div style={{ fontSize: 11, color: 'var(--slate2)', marginTop: 1 }}>{indicators.length} indicators</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {gUp > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: 20,
                background: '#e6faf4',
                color: '#065f46',
                border: '1px solid #a7f3d0',
              }}
            >
              {gUp}↑
            </span>
          )}
          {gDn > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 9px',
                borderRadius: 20,
                background: '#fff0f0',
                color: '#991b1b',
                border: '1px solid #fca5a5',
              }}
            >
              {gDn}↓
            </span>
          )}
        </div>
      </div>
      {indicators.map((i) => (
        <IndicatorRow key={i.n} indicator={i} groupColor={gColor} />
      ))}
    </div>
  );
}

function IndicatorRow({ indicator: i, groupColor }: { indicator: Indicator; groupColor: string }) {
  const chg = +(i.v - i.p).toFixed(2);
  const cls = chg > 0 ? 'up' : chg < 0 ? 'dn' : 'fl';
  const sigBg = i.s === 'Upside' ? '#e6faf4' : i.s === 'Downside' ? '#fff0f0' : i.s === 'Caution' ? '#fffaeb' : 'var(--surface)';
  const sigColor = i.s === 'Upside' ? '#065f46' : i.s === 'Downside' ? '#991b1b' : i.s === 'Caution' ? '#92400e' : 'var(--slate)';
  const sigBorder = i.s === 'Upside' ? '#a7f3d0' : i.s === 'Downside' ? '#fca5a5' : i.s === 'Caution' ? '#fcd34d' : 'var(--border)';
  const barW = Math.min(100, (Math.abs(chg) / Math.max(Math.abs(i.p), 0.01)) * 300 + 12);
  const barColor = i.s === 'Upside' ? groupColor : i.s === 'Downside' ? '#e03e3e' : i.s === 'Caution' ? '#c47a0c' : 'var(--slate3)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {i.n}
        </div>
        <div style={{ height: 3, background: 'var(--surface)', borderRadius: 3, marginTop: 5, overflow: 'hidden' }}>
          <div style={{ width: `${barW}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width .4s ease' }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, width: 52 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
          {i.v}
          {i.u}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600 }} className={cls}>
          {chg >= 0 ? '+' : ''}
          {chg}
          {i.u}
        </div>
      </div>
      <div style={{ width: 68, textAlign: 'right', flexShrink: 0 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 20,
            background: sigBg,
            color: sigColor,
            border: `1px solid ${sigBorder}`,
            whiteSpace: 'nowrap',
          }}
        >
          {i.s}
        </span>
      </div>
    </div>
  );
}
