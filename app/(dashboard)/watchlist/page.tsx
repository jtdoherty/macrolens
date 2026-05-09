import { WatchlistList } from '@/components/WatchlistList';

export default function WatchlistPage() {
  return (
    <>
      <div className="ph">
        <div className="ph-inner">
          <h1>Watchlist</h1>
          <p>Your saved tickers with forecast signal summary</p>
        </div>
      </div>
      <div className="pb">
        <WatchlistList />
      </div>
    </>
  );
}
