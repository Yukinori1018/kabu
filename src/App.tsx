import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PortfolioOverview from './components/PortfolioOverview';
import StockBrowser from './components/StockBrowser';
import MonthlyPlanner from './components/MonthlyPlanner';
import NisaGuide from './components/NisaGuide';
import PortfolioBuilder from './components/PortfolioBuilder';
import type { PortfolioItem, StockBenefit } from './types/stock';
import { stocksData } from './data/stocks';

type TabId = 'myportfolio' | 'stocks' | 'portfolio' | 'planner' | 'nisa';

const LS_PORTFOLIO = 'kabu_portfolio';
const LS_INITIAL_BUDGET = 'kabu_initial_budget';
const LS_MONTHLY_BUDGET = 'kabu_monthly_budget';

function loadNumber(key: string, fallback: number): number {
  try {
    const v = parseInt(localStorage.getItem(key) ?? '', 10);
    return v > 0 ? v : fallback;
  } catch { return fallback; }
}

function loadPortfolio(): PortfolioItem[] {
  try {
    const saved = localStorage.getItem(LS_PORTFOLIO);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as { code: string; lots: number }[];
    return parsed.flatMap(({ code, lots }) => {
      const stock = stocksData.find(s => s.code === code);
      return stock ? [{ stock, lots }] : [];
    });
  } catch { return []; }
}

// URL エンコード: [{c:code, l:lots}] → base64url
export function encodePortfolioToUrl(items: PortfolioItem[]): string {
  const data = items.map(i => ({ c: i.stock.code, l: i.lots }));
  const json = JSON.stringify(data);
  const b64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#p=${b64}`;
}

// URL デコード: hash から PortfolioItem[] を復元
function decodePortfolioFromHash(): PortfolioItem[] {
  try {
    const match = window.location.hash.match(/[#&]p=([A-Za-z0-9_-]+)/);
    if (!match) return [];
    const b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
    const parsed = JSON.parse(atob(padded)) as { c: string; l: number }[];
    return parsed.flatMap(({ c, l }) => {
      const stock = stocksData.find(s => s.code === c);
      return stock ? [{ stock, lots: Math.max(1, l) }] : [];
    });
  } catch { return []; }
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('stocks');

  // 予算（App レベルで管理し全タブに共有）
  const [initialBudget, setInitialBudgetState] = useState<number>(() =>
    loadNumber(LS_INITIAL_BUDGET, 3_500_000)
  );
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() =>
    loadNumber(LS_MONTHLY_BUDGET, 100_000)
  );

  const setInitialBudget = useCallback((v: number) => {
    setInitialBudgetState(v);
    try { localStorage.setItem(LS_INITIAL_BUDGET, String(v)); } catch { /* ignore */ }
  }, []);

  const setMonthlyBudget = useCallback((v: number) => {
    setMonthlyBudgetState(v);
    try { localStorage.setItem(LS_MONTHLY_BUDGET, String(v)); } catch { /* ignore */ }
  }, []);

  // ポートフォリオ（localStorage に永続化）
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(loadPortfolio);

  // URLハッシュにポートフォリオが含まれていれば復元
  useEffect(() => {
    const fromUrl = decodePortfolioFromHash();
    if (fromUrl.length > 0) {
      setPortfolioItems(fromUrl);
      setActiveTab('myportfolio');
      // ハッシュをきれいにする
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_PORTFOLIO,
        JSON.stringify(portfolioItems.map(i => ({ code: i.stock.code, lots: i.lots })))
      );
    } catch { /* ignore */ }
  }, [portfolioItems]);

  const addToPortfolio = useCallback((stock: StockBenefit) => {
    setPortfolioItems(prev =>
      prev.find(i => i.stock.code === stock.code) ? prev : [...prev, { stock, lots: 1 }]
    );
  }, []);

  const removeFromPortfolio = useCallback((code: string) => {
    setPortfolioItems(prev => prev.filter(i => i.stock.code !== code));
  }, []);

  const updateLots = useCallback((code: string, lots: number) => {
    if (lots < 1) return;
    setPortfolioItems(prev =>
      prev.map(i => i.stock.code === code ? { ...i, lots } : i)
    );
  }, []);

  const isInPortfolio = useCallback(
    (code: string) => portfolioItems.some(i => i.stock.code === code),
    [portfolioItems]
  );

  // 株価の動的フェッチ（毎週自動更新される prices.json）
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [pricesLastUpdated, setPricesLastUpdated] = useState<string>('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/prices.json`)
      .then(r => r.json())
      .then((data: { lastUpdated?: string; prices?: Record<string, number> }) => {
        if (data.prices) setPriceMap(data.prices);
        if (data.lastUpdated) setPricesLastUpdated(data.lastUpdated);
      })
      .catch(() => { /* フォールバック: 静的データをそのまま使用 */ });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'myportfolio':
        return (
          <PortfolioBuilder
            items={portfolioItems}
            onRemove={removeFromPortfolio}
            onUpdateLots={updateLots}
            onGoToStocks={() => setActiveTab('stocks')}
            initialBudget={initialBudget}
            monthlyBudget={monthlyBudget}
            onChangeInitialBudget={setInitialBudget}
            onChangeMonthlyBudget={setMonthlyBudget}
            onImport={setPortfolioItems}
          />
        );
      case 'stocks':
        return (
          <StockBrowser
            onAddToPortfolio={addToPortfolio}
            onRemoveFromPortfolio={removeFromPortfolio}
            isInPortfolio={isInPortfolio}
            priceMap={priceMap}
            pricesLastUpdated={pricesLastUpdated}
          />
        );
      case 'portfolio':
        return (
          <PortfolioOverview
            initialBudget={initialBudget}
            monthlyBudget={monthlyBudget}
          />
        );
      case 'planner':
        return <MonthlyPlanner monthlyBudget={monthlyBudget} />;
      case 'nisa':
        return <NisaGuide />;
      default:
        return (
          <StockBrowser
            onAddToPortfolio={addToPortfolio}
            onRemoveFromPortfolio={removeFromPortfolio}
            isInPortfolio={isInPortfolio}
            priceMap={priceMap}
            pricesLastUpdated={pricesLastUpdated}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <Header
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as TabId)}
        portfolioCount={portfolioItems.length}
      />
      <main className="pb-12">{renderContent()}</main>
      <footer className="bg-white border-t border-warm-100 py-6 text-center text-xs text-gray-400">
        <p>🌸 株主優待ポートフォリオ - はじめての株式投資 2025</p>
        <p className="mt-1">※ 本アプリの情報は教育目的です。投資は自己責任でお願いします。株価・配当データは参考値です。</p>
      </footer>
    </div>
  );
}

export default App;


