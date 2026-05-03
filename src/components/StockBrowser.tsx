import { useState, useMemo } from 'react';
import type { StockBenefit, StockCategory, StockSource } from '../types/stock';
import { stocksData } from '../data/stocks';
import StockCard from './StockCard';

type SortKey = 'effectiveYield' | 'virtualPlus100' | 'dividendYield' | 'benefitValue' | 'stockPrice' | 'requiredInvestment' | 'valueScore';

interface StockBrowserProps {
  onAddToPortfolio: (stock: StockBenefit) => void;
  onRemoveFromPortfolio: (code: string) => void;
  isInPortfolio: (code: string) => boolean;
  priceMap?: Record<string, number>;
  pricesLastUpdated?: string;
}

const allCategories: StockCategory[] = [
  '食品・飲食',
  '小売',
  'エンタメ',
  '医薬・ヘルスケア',
  '金融',
  '航空・旅行',
  '通信・IT',
  '商社・エネルギー',
  '不動産',
  'その他',
];
const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const sourceFilters: { key: StockSource | 'all'; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'kiriya', label: '👴 桐谷さん' },
  { key: 'youtuber', label: '📺 YouTuber' },
  { key: 'research', label: '🔍 独自リサーチ' },
];

const investmentRanges = [
  { label: 'すべて', min: 0, max: Infinity },
  { label: '〜10万円', min: 0, max: 100000 },
  { label: '10〜30万円', min: 100000, max: 300000 },
  { label: '30〜50万円', min: 300000, max: 500000 },
  { label: '50万円〜', min: 500000, max: Infinity },
];

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'effectiveYield', label: '✨ 実質利回り順' },
  { key: 'virtualPlus100', label: '💴 年間仮想プラス順（100株）' },
  { key: 'dividendYield', label: '配当利回り順' },
  { key: 'benefitValue', label: '優待価値順' },
  { key: 'stockPrice', label: '株価順（低い）' },
  { key: 'requiredInvestment', label: '必要投資額順' },
  { key: 'valueScore', label: 'お得スコア順' },
];

function computeEffectiveYield(s: StockBenefit): number {
  const investment = s.stockPrice * s.minShares;
  if (investment === 0) return 0;
  return (s.dividendPerShare * s.minShares + s.benefitValue) / investment * 100;
}

function computeVirtualPlus100(s: StockBenefit): number {
  const benefit100 = s.minShares <= 100 ? Math.round(s.benefitValue * (100 / s.minShares)) : 0;
  return s.dividendPerShare * 100 + benefit100;
}

export default function StockBrowser({
  onAddToPortfolio,
  onRemoveFromPortfolio,
  isInPortfolio,
  priceMap = {},
  pricesLastUpdated = '',
}: StockBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<StockCategory | 'すべて'>('すべて');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('effectiveYield');
  const [searchText, setSearchText] = useState('');
  const [selectedSource, setSelectedSource] = useState<StockSource | 'all'>('all');

  // 動的価格を静的データにマージ
  const mergedStocks = useMemo<StockBenefit[]>(() => {
    return stocksData.map(s => {
      const livePrice = priceMap[s.code];
      if (!livePrice) return s;
      const price = livePrice;
      return {
        ...s,
        stockPrice: price,
        dividendYield: Math.round(s.dividendPerShare / price * 1000) / 10,
        requiredInvestment: price * s.minShares,
      };
    });
  }, [priceMap]);

  const filtered = useMemo(() => {
    let data: StockBenefit[] = [...mergedStocks];

    if (selectedSource !== 'all') {
      data = data.filter((s) => s.source === selectedSource);
    }
    if (selectedCategory !== 'すべて') {
      data = data.filter((s) => s.category === selectedCategory);
    }
    if (selectedMonth !== null) {
      data = data.filter((s) => s.rightsMonth === selectedMonth);
    }
    const range = investmentRanges[selectedRangeIndex];
    data = data.filter((s) => s.requiredInvestment >= range.min && s.requiredInvestment <= range.max);

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.includes(q) ||
          s.benefitContent.toLowerCase().includes(q)
      );
    }

    if (sortKey === 'effectiveYield' || sortKey === 'valueScore') {
      data.sort((a, b) => computeEffectiveYield(b) - computeEffectiveYield(a));
    } else if (sortKey === 'virtualPlus100') {
      data.sort((a, b) => computeVirtualPlus100(b) - computeVirtualPlus100(a));
    } else {
      data.sort((a, b) => b[sortKey] - a[sortKey]);
    }

    return data;
  }, [mergedStocks, selectedCategory, selectedMonth, selectedRangeIndex, sortKey, searchText, selectedSource]);

  const hasActiveFilters =
    selectedCategory !== 'すべて' ||
    selectedMonth !== null ||
    selectedRangeIndex !== 0 ||
    searchText !== '' ||
    selectedSource !== 'all';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Page header */}
      <div className="bg-gradient-to-r from-orange-500 to-warm-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🎁</span>
          <div>
            <h2 className="text-xl font-bold">銘柄ブラウザー</h2>
            <p className="text-orange-100 text-sm">
              優待株・高配当株を楽しく探そう！全{stocksData.length}銘柄掲載
            </p>
            {pricesLastUpdated && (
              <p className="text-orange-200 text-xs mt-0.5">
                📅 株価更新日: {pricesLastUpdated}（毎週月曜自動更新）
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="会社名・証券コード・優待内容で検索..."
          className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent bg-white"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-warm-100 space-y-4">
        <h3 className="font-bold text-gray-700 text-sm">🔽 絞り込み・並び替え</h3>

        {/* Source filter */}
        <div>
          <p className="text-xs text-gray-500 mb-2">情報ソース</p>
          <div className="flex flex-wrap gap-2">
            {sourceFilters.map((s) => (
              <button
                key={s.key}
                onClick={() => setSelectedSource(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedSource === s.key
                    ? 'bg-warm-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-warm-100 hover:text-warm-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div>
          <p className="text-xs text-gray-500 mb-2">カテゴリ</p>
          <div className="flex flex-wrap gap-2">
            {(['すべて', ...allCategories] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-warm-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-warm-100 hover:text-warm-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Month filter */}
        <div>
          <p className="text-xs text-gray-500 mb-2">権利確定月</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedMonth === null
                  ? 'bg-warm-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-warm-100 hover:text-warm-700'
              }`}
            >
              すべて
            </button>
            {allMonths.map((m) => {
              const hasStock = stocksData.some((s) => s.rightsMonth === m);
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  disabled={!hasStock}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedMonth === m
                      ? 'bg-warm-500 text-white shadow-sm'
                      : hasStock
                      ? 'bg-gray-100 text-gray-600 hover:bg-warm-100 hover:text-warm-700'
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {monthNames[m - 1]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Investment range + sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">必要投資額</p>
            <div className="flex flex-wrap gap-2">
              {investmentRanges.map((r, i) => (
                <button
                  key={r.label}
                  onClick={() => setSelectedRangeIndex(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedRangeIndex === i
                      ? 'bg-warm-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-warm-100 hover:text-warm-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">並び替え</p>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-warm-700">{filtered.length}</span> /{' '}
          {stocksData.length} 銘柄が見つかりました
        </p>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedCategory('すべて');
              setSelectedMonth(null);
              setSelectedRangeIndex(0);
              setSearchText('');
              setSelectedSource('all');
            }}
            className="text-xs text-warm-600 hover:text-warm-800 underline"
          >
            フィルターをリセット
          </button>
        )}
      </div>

      {/* Cards grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((stock) => (
            <StockCard
              key={stock.code}
              stock={stock}
              inPortfolio={isInPortfolio(stock.code)}
              onAdd={onAddToPortfolio}
              onRemove={onRemoveFromPortfolio}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg">該当する銘柄が見つかりませんでした</p>
          <p className="text-sm mt-1">フィルターを変更してみてください</p>
        </div>
      )}
    </div>
  );
}
