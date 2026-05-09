'use client';

import { useIsWatched, toggleWatchlist } from '@/lib/store';

// Small star toggle. Renders ☆ when not in the watchlist, ★ when in.
// Multiple stars on the same ticker stay in sync via useSyncExternalStore.
export function WatchlistStar({ ticker }: { ticker: string }) {
  const watched = useIsWatched(ticker);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(ticker);
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
