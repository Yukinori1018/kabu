import { useState } from 'react';
import Header from './components/Header';
import PortfolioOverview from './components/PortfolioOverview';
import StockBrowser from './components/StockBrowser';
import MonthlyPlanner from './components/MonthlyPlanner';
import NisaGuide from './components/NisaGuide';

type TabId = 'portfolio' | 'stocks' | 'planner' | 'nisa';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('portfolio');

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return <PortfolioOverview />;
      case 'stocks':
        return <StockBrowser />;
      case 'planner':
        return <MonthlyPlanner />;
      case 'nisa':
        return <NisaGuide />;
      default:
        return <PortfolioOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
      <main className="pb-12">
        {renderContent()}
      </main>
      <footer className="bg-white border-t border-warm-100 py-6 text-center text-xs text-gray-400">
        <p>🌸 株主優待ポートフォリオ - はじめての株投資 2024</p>
        <p className="mt-1">※ 本アプリの情報は教育目的です。投資は自己責任でお願いします。株価・配当データはサンプルです。</p>
      </footer>
    </div>
  );
}

export default App;
