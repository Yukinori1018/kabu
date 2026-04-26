import { useState, useMemo } from 'react';
import type { StockBenefit, StockCategory } from '../types/stock';
import { stocksData } from '../data/stocks';
import StockCard from './StockCard';

type SortKey = 'dividendYield' | 'benefitValue' | 'stockPrice' | 'requiredInvestment' | 'valueScore';

const allCategories: StockCategory[] = ['食品・飲食', '小売', 'エンタメ', '医薬・ヘルスケア', '金融', '航空・旅行'];
const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const investmentRanges = [
  { label: 'すべて', min: 0, max: Infinity },
  { label: '〜10万円', min: 0, max: 100000 },
  { label: '10〜30万円', min: 100000, max: 300000 },
  { label: '30〜50万円', min: 300000, max: 500000 },
  { label: '50万円〜', min: 500000, max: Infinity },
];

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'dividendYield', label: '配当利回り順' },
  { key: 'benefitValue', label: '優待価値順' },
  { key: 'stockPrice', label: '株価順（低い）' },
  { key: 'requiredInvestment', label: '必要投資額順' },
  { key: 'valueScore', label: 'お得度順' },
];

export default function StockBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<StockCategory | 'すべて'>('すべて');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('valueScore');
  const [searchText, setSearchText] = useState('');

  const filtered = useMemo(() => {
    let data: StockBenefit[] = [...stocksData];

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

    data.sort((a, b) => b[sortKey] - a[sortKey]);

    return data;
  }, [selectedCategory, selectedMonth, selectedRangeIndex, sortKey, searchText]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Page header */}
      <div className="bg-gradient-to-r from-orange-500 to-warm-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🎁</span>
          <div>
            <h2 className="text-xl font-bold">株主優待ブラウザー</h2>
            <p className="text-orange-100 text-sm">
              桐谷さんスタイルで優待株を楽しく探そう！全{stocksData.length}銘柄掲載
            </p>
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
          <span className="font-bold text-warm-700">{filtered.length}</span> 銘柄が見つかりました
        </p>
        {(selectedCategory !== 'すべて' || selectedMonth !== null || selectedRangeIndex !== 0 || searchText) && (
          <button
            onClick={() => {
              setSelectedCategory('すべて');
              setSelectedMonth(null);
              setSelectedRangeIndex(0);
              setSearchText('');
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
            <StockCard key={stock.code} stock={stock} />
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
