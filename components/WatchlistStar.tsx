'use client';

import { useEffect, useState } from 'react';
import { isWatched, toggleWatchlist } from '@/lib/store';

// Small star toggle. Renders a hollow ☆ when not in the watchlist, filled ★ when in.
// On click, flips the state in localStorage and re-renders.
export function WatchlistStar({ ticker }: { ticker: string }) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isWatched(ticker));
  }, [ticker]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleWatchlist(ticker);
    setWatched(next.includes(ticker));
  };

  return (
    <button
      type="button"
      className="btn btno"
      onClick={onClick}
      aria-label={watched ? `Remove ${ticker} from watchlist` : `Add ${ticker} to watchlist`}
      style={{ fontSize: 13, padding: '4px 10px', whiteSpace: 'nowrap', minWidth: 32 }}
    >
      {watched ? '★' : '☆'}
    </button>
  );
}
