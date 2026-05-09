import { PortfolioList } from '@/components/PortfolioList';

export default function PortfolioPage() {
  return (
    <>
      <div className="ph">
        <div className="ph-inner">
          <h1>Portfolio Tracker</h1>
          <p>Track your holdings against macro-adjusted forecasts and valuation bands</p>
        </div>
      </div>
      <div className="pb">
        <PortfolioList />
      </div>
    </>
  );
}
