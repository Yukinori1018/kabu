import { useState } from 'react';
import Header from './components/Header';
import PortfolioOverview from './components/PortfolioOverview';
import StockBrowser from './components/StockBrowser';
import MonthlyPlanner from './components/MonthlyPlanner';
import NisaGuide from './components/NisaGuide';
import PortfolioBuilder from './components/PortfolioBuilder';
import type { PortfolioItem, StockBenefit } from './types/stock';

type TabId = 'myportfolio' | 'stocks' | 'portfolio' | 'planner' | 'nisa';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('stocks');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  const addToPortfolio = (stock: StockBenefit) => {
    setPortfolioItems((prev) =>
      prev.find((i) => i.stock.code === stock.code) ? prev : [...prev, { stock, lots: 1 }]
    );
  };

  const removeFromPortfolio = (code: string) => {
    setPortfolioItems((prev) => prev.filter((i) => i.stock.code !== code));
  };

  const updateLots = (code: string, lots: number) => {
    if (lots < 1) return;
    setPortfolioItems((prev) =>
      prev.map((i) => (i.stock.code === code ? { ...i, lots } : i))
    );
  };

  const isInPortfolio = (code: string) => portfolioItems.some((i) => i.stock.code === code);

  const renderContent = () => {
    switch (activeTab) {
      case 'myportfolio':
        return (
          <PortfolioBuilder
            items={portfolioItems}
            onRemove={removeFromPortfolio}
            onUpdateLots={updateLots}
            onGoToStocks={() => setActiveTab('stocks')}
          />
        );
      case 'stocks':
        return (
          <StockBrowser
            onAddToPortfolio={addToPortfolio}
            onRemoveFromPortfolio={removeFromPortfolio}
            isInPortfolio={isInPortfolio}
          />
        );
      case 'portfolio':
        return <PortfolioOverview />;
      case 'planner':
        return <MonthlyPlanner />;
      case 'nisa':
        return <NisaGuide />;
      default:
        return (
          <StockBrowser
            onAddToPortfolio={addToPortfolio}
            onRemoveFromPortfolio={removeFromPortfolio}
            isInPortfolio={isInPortfolio}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabId)}
        portfolioCount={portfolioItems.length}
      />
      <main className="pb-12">{renderContent()}</main>
      <footer className="bg-white border-t border-warm-100 py-6 text-center text-xs text-gray-400">
        <p>🌸 株主優待ポートフォリオ - はじめての株投資 2025</p>
        <p className="mt-1">※ 本アプリの情報は教育目的です。投資は自己責任でお願いします。株価・配当データは目安です。</p>
      </footer>
    </div>
  );
}

export default App;
