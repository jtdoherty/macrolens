'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

// Filter inputs that update the URL on change. Server component renders the table.
//
// Why a client component just for inputs: <input onChange> can't navigate from a
// pure server component. We keep the table SSR'd; only the filter row is client.
export function ScreenerFilters({
  sectors,
  signals,
  confidences,
}: {
  sectors: string[];
  signals: string[];
  confidences: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`/screener?${next.toString()}`, { scroll: false });
    });
  };

  return (
    <>
      <input
        className="inp"
        placeholder="🔍 Search ticker or industry…"
        defaultValue={params.get('srch') ?? ''}
        onChange={(e) => setParam('srch', e.target.value)}
        style={{ width: 220 }}
      />
      <select
        className="inp"
        defaultValue={params.get('sec') ?? ''}
        onChange={(e) => setParam('sec', e.target.value)}
        style={{ width: 140 }}
      >
        <option value="">All sectors</option>
        {sectors.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        className="inp"
        defaultValue={params.get('sig') ?? ''}
        onChange={(e) => setParam('sig', e.target.value)}
        style={{ width: 170 }}
      >
        <option value="">All signals</option>
        {signals.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        className="inp"
        defaultValue={params.get('conf') ?? ''}
        onChange={(e) => setParam('conf', e.target.value)}
        style={{ width: 140 }}
      >
        <option value="">All confidence</option>
        {confidences.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </>
  );
}
