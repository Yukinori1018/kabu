import { useState } from 'react';
import type { PortfolioItem, StockSource } from '../types/stock';
import AIEvaluation from './AIEvaluation';

interface PortfolioBuilderProps {
  items: PortfolioItem[];
  onRemove: (code: string) => void;
  onUpdateLots: (code: string, lots: number) => void;
  onGoToStocks: () => void;
  initialBudget: number;
  monthlyBudget: number;
  onChangeInitialBudget: (v: number) => void;
  onChangeMonthlyBudget: (v: number) => void;
}

const sourceConfig: Record<StockSource, { className: string; label: string }> = {
  kiriya: { className: 'bg-pink-100 text-pink-700', label: '👴 桐谷さん' },
  youtuber: { className: 'bg-purple-100 text-purple-700', label: '📺 YouTuber' },
  research: { className: 'bg-teal-100 text-teal-700', label: '🔍 独自' },
};

function formatYen(amount: number): string {
  return Math.round(amount).toLocaleString('ja-JP') + '円';
}

export default function PortfolioBuilder({
  items,
  onRemove,
  onUpdateLots,
  onGoToStocks,
  initialBudget,
  monthlyBudget,
  onChangeInitialBudget,
  onChangeMonthlyBudget,
}: PortfolioBuilderProps) {
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [initialBudgetInput, setInitialBudgetInput] = useState<string>(String(initialBudget));
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState<string>(String(monthlyBudget));

  function handleInitialBudgetChange(value: string) {
    setInitialBudgetInput(value);
    const n = parseInt(value, 10);
    if (!isNaN(n) && n > 0) onChangeInitialBudget(n);
  }

  function handleMonthlyBudgetChange(value: string) {
    setMonthlyBudgetInput(value);
    const n = parseInt(value, 10);
    if (!isNaN(n) && n > 0) onChangeMonthlyBudget(n);
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-gradient-to-r from-orange-500 to-warm-500 rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🛒</span>
            <div>
              <h2 className="text-xl font-bold">マイポートフォリオ</h2>
              <p className="text-orange-100 text-sm">
                自分だけの優待ポートフォリオを組み立てよう！
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-warm-100 p-10 text-center">
          <p className="text-6xl mb-4">🌱</p>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            まだ銘柄が選ばれていません
          </h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            「株主優待」タブから気になる銘柄を選んで、
            <br />
            あなただけのポートフォリオを作りましょう！
            <br />
            必要投資額・配当金・優待金額を自動計算します。
          </p>
          <button
            onClick={onGoToStocks}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition-colors"
          >
            🎁 株を探しに行く
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalInvestment = items.reduce(
    (sum, i) => sum + i.stock.stockPrice * i.stock.minShares * i.lots,
    0
  );
  const totalDividend = items.reduce(
    (sum, i) => sum + i.stock.dividendPerShare * i.stock.minShares * i.lots,
    0
  );
  const totalBenefit = items.reduce((sum, i) => sum + i.stock.benefitValue * i.lots, 0);
  const weightedYield = totalInvestment > 0 ? (totalDividend / totalInvestment) * 100 : 0;
  const effectiveYield =
    totalInvestment > 0 ? ((totalDividend + totalBenefit) / totalInvestment) * 100 : 0;
  const budgetUsedPct = (totalInvestment / initialBudget) * 100;
  const remainingBudget = initialBudget - totalInvestment;

  const yieldColor =
    effectiveYield > 5
      ? 'text-green-600'
      : effectiveYield >= 3
      ? 'text-orange-600'
      : 'text-gray-500';

  const overBudget = totalInvestment > initialBudget;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Page header */}
      <div className="bg-gradient-to-r from-orange-500 to-warm-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🛒</span>
            <div>
              <h2 className="text-xl font-bold">マイポートフォリオ</h2>
              <p className="text-orange-100 text-sm">
                {items.length}銘柄を選択中
              </p>
            </div>
          </div>
          <button
            onClick={onGoToStocks}
            className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg whitespace-nowrap transition-colors"
          >
            + 銘柄追加
          </button>
        </div>
      </div>

      {/* Budget settings collapsible */}
      <div className="bg-white rounded-2xl shadow-sm border border-warm-100 overflow-hidden">
        <button
          onClick={() => setBudgetOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-warm-700 hover:bg-warm-50 transition-colors"
        >
          <span>⚙️ 予算設定</span>
          <span className="text-gray-400 text-xs">{budgetOpen ? '▲ 閉じる' : '▼ 開く'}</span>
        </button>
        {budgetOpen && (
          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-warm-100 pt-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                初期投資予算（円）
              </label>
              <input
                type="number"
                min={1}
                step={100000}
                value={initialBudgetInput}
                onChange={(e) => handleInitialBudgetChange(e.target.value)}
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                現在: {formatYen(initialBudget)}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                月間積立予算（円）
              </label>
              <input
                type="number"
                min={1}
                step={10000}
                value={monthlyBudgetInput}
                onChange={(e) => handleMonthlyBudgetChange(e.target.value)}
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                現在: {formatYen(monthlyBudget)}／月
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky summary panel */}
      <div className="sticky top-[56px] sm:top-[60px] z-40 bg-white rounded-2xl shadow-md border border-warm-200 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          <div className="bg-warm-50 rounded-lg p-2.5 border border-warm-100">
            <p className="text-[10px] text-warm-600 font-medium mb-0.5">銘柄数</p>
            <p className="text-base font-bold text-warm-800">{items.length}銘柄</p>
          </div>
          <div className="bg-warm-50 rounded-lg p-2.5 border border-warm-100">
            <p className="text-[10px] text-warm-600 font-medium mb-0.5">必要投資額合計</p>
            <p className={`text-base font-bold ${overBudget ? 'text-red-600' : 'text-warm-800'}`}>
              {formatYen(totalInvestment)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5 border border-green-100">
            <p className="text-[10px] text-green-600 font-medium mb-0.5">年間配当金合計</p>
            <p className="text-base font-bold text-green-700">{formatYen(totalDividend)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
            <p className="text-[10px] text-blue-600 font-medium mb-0.5">加重平均配当利回り</p>
            <p className="text-base font-bold text-blue-700">{weightedYield.toFixed(2)}%</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
            <p className="text-[10px] text-amber-600 font-medium mb-0.5">年間優待金額合計</p>
            <p className="text-base font-bold text-amber-700">{formatYen(totalBenefit)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-100">
            <p className="text-[10px] text-purple-600 font-medium mb-0.5">実質利回り</p>
            <p className={`text-base font-bold ${yieldColor}`}>{effectiveYield.toFixed(2)}%</p>
          </div>
        </div>

        {/* Budget bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">
              予算{(initialBudget / 10000).toLocaleString()}万円のうち{' '}
              <span className={`font-bold ${overBudget ? 'text-red-600' : 'text-warm-700'}`}>
                {budgetUsedPct.toFixed(1)}%
              </span>{' '}
              使用
            </span>
            <span className={overBudget ? 'text-red-600 font-bold' : 'text-gray-500'}>
              {overBudget
                ? `予算オーバー: ${formatYen(-remainingBudget)}`
                : `残り: ${formatYen(remainingBudget)}`}
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                overBudget
                  ? 'bg-red-500'
                  : budgetUsedPct > 80
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Monthly budget info */}
        <div className="mt-2 text-xs text-gray-500">
          月間積立予算: <span className="font-bold text-orange-600">{formatYen(monthlyBudget)}</span>
          ／月　→　年間積立: <span className="font-bold text-orange-600">{formatYen(monthlyBudget * 12)}</span>
        </div>
      </div>

      {/* Stock items list */}
      <div className="space-y-3">
        {items.map((item) => {
          const investment = item.stock.stockPrice * item.stock.minShares * item.lots;
          const dividend = item.stock.dividendPerShare * item.stock.minShares * item.lots;
          const benefit = item.stock.benefitValue * item.lots;
          const source = sourceConfig[item.stock.source];
          return (
            <div
              key={item.stock.code}
              className="bg-white rounded-2xl shadow-sm border border-warm-100 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-warm-50 flex items-center justify-center text-2xl border border-warm-100 shrink-0">
                    {item.stock.benefitIcon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">{item.stock.name}</p>
                      <span className="text-xs text-gray-400">({item.stock.code})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${source.className}`}
                      >
                        {source.label}
                      </span>
                      <span className="text-xs text-gray-500">{item.stock.benefitContent}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.stock.code)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 flex items-center justify-center text-sm font-bold transition-colors shrink-0"
                  aria-label="削除"
                >
                  ✕
                </button>
              </div>

              {/* Lot adjuster + metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-warm-50 rounded-lg p-2.5 border border-warm-100">
                  <p className="text-[10px] text-warm-600 font-medium mb-1">
                    単元数（1単元={item.stock.minShares}株）
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateLots(item.stock.code, item.lots - 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-warm-100 border border-warm-200 text-warm-700 font-bold transition-colors"
                      disabled={item.lots <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.lots}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 1) onUpdateLots(item.stock.code, v);
                      }}
                      className="w-14 text-center py-1 rounded-lg border border-warm-200 bg-white text-sm font-bold text-warm-700"
                    />
                    <button
                      onClick={() => onUpdateLots(item.stock.code, item.lots + 1)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-warm-100 border border-warm-200 text-warm-700 font-bold transition-colors"
                    >
                      ＋
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-gray-500 font-medium mb-0.5">投資額</p>
                  <p className="text-sm font-bold text-gray-800">{formatYen(investment)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-green-600 font-medium mb-0.5">年間配当</p>
                  <p className="text-sm font-bold text-green-700">{formatYen(dividend)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-amber-600 font-medium mb-0.5">年間優待</p>
                  <p className="text-sm font-bold text-amber-700">{formatYen(benefit)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Evaluation */}
      <AIEvaluation items={items} totalInvestment={totalInvestment} />
    </div>
  );
}
