import type { StockBenefit, StockSource } from '../types/stock';

interface StockCardProps {
  stock: StockBenefit;
  inPortfolio: boolean;
  onAdd: (stock: StockBenefit) => void;
  onRemove: (code: string) => void;
}

function formatYen(amount: number): string {
  return amount.toLocaleString('ja-JP') + '円';
}

function YieldBadge({ yield_ }: { yield_: number }) {
  if (yield_ >= 3) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        🟢 {yield_.toFixed(2)}%
      </span>
    );
  } else if (yield_ >= 2) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
        🟠 {yield_.toFixed(2)}%
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
        ⚪ {yield_.toFixed(2)}%
      </span>
    );
  }
}

function ValueStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-base ${i <= score ? 'text-yellow-400' : 'text-gray-200'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

const categoryColors: Record<string, string> = {
  '食品・飲食': 'bg-red-100 text-red-700',
  '小売': 'bg-blue-100 text-blue-700',
  'エンタメ': 'bg-purple-100 text-purple-700',
  '医薬・ヘルスケア': 'bg-teal-100 text-teal-700',
  '金融': 'bg-indigo-100 text-indigo-700',
  '航空・旅行': 'bg-sky-100 text-sky-700',
  '通信・IT': 'bg-cyan-100 text-cyan-700',
  '商社・エネルギー': 'bg-amber-100 text-amber-700',
  '不動産': 'bg-emerald-100 text-emerald-700',
  'その他': 'bg-gray-100 text-gray-700',
};

const sourceConfig: Record<StockSource, { className: string; label: string }> = {
  kiriya: { className: 'bg-pink-100 text-pink-700', label: '👴 桐谷さんおすすめ' },
  youtuber: { className: 'bg-purple-100 text-purple-700', label: '📺 人気YouTuber注目' },
  research: { className: 'bg-teal-100 text-teal-700', label: '🔍 独自リサーチ' },
};

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function StockCard({ stock, inPortfolio, onAdd, onRemove }: StockCardProps) {
  const categoryColor = categoryColors[stock.category] || 'bg-gray-100 text-gray-700';
  const source = sourceConfig[stock.source];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-warm-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Source badge */}
      <div className={`px-4 py-1.5 text-xs font-bold ${source.className}`}>
        {source.label}
      </div>

      {/* Card Header */}
      <div className="bg-gradient-to-r from-warm-50 to-orange-50 px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl border border-warm-100">
              {stock.benefitIcon}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{stock.name}</p>
              <p className="text-xs text-gray-400">{stock.nameEn} ({stock.code})</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap ${categoryColor}`}>
            {stock.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-4 py-3 space-y-3 flex-1">
        {/* Benefit highlight */}
        <div className="bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
          <p className="text-xs text-amber-600 font-medium mb-0.5">🎁 優待内容</p>
          <p className="text-sm font-semibold text-amber-900">{stock.benefitContent}</p>
          {stock.otherConditions && (
            <p className="text-xs text-amber-600 mt-0.5">※ {stock.otherConditions}</p>
          )}
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">株価</p>
            <p className="font-bold text-gray-800">{formatYen(stock.stockPrice)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">配当利回り</p>
            <YieldBadge yield_={stock.dividendYield} />
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">権利確定月</p>
            <p className="font-bold text-gray-800">{monthNames[stock.rightsMonth - 1]}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">配当金/株</p>
            <p className="font-bold text-gray-800">{formatYen(stock.dividendPerShare)}</p>
          </div>
        </div>

        {/* Required investment + shares */}
        <div className="flex items-center justify-between bg-warm-50 rounded-xl px-3 py-2 border border-warm-100">
          <div>
            <p className="text-xs text-warm-600">必要投資額（{stock.minShares.toLocaleString()}株）</p>
            <p className="text-lg font-bold text-warm-700">{formatYen(stock.requiredInvestment)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-warm-600">優待価値</p>
            <p className="font-bold text-warm-700">{formatYen(stock.benefitValue)}</p>
          </div>
        </div>

        {/* Value score + description */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">お得度</p>
            <ValueStars score={stock.valueScore} />
          </div>
          <p className="text-xs text-gray-500 text-right max-w-[140px] leading-relaxed">{stock.description}</p>
        </div>
      </div>

      {/* Add/Remove button */}
      <div className="px-4 pb-4 pt-1">
        {inPortfolio ? (
          <button
            onClick={() => onRemove(stock.code)}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-green-500 hover:bg-green-600 text-white shadow-sm transition-colors"
          >
            ✓ ポートフォリオ追加済み
          </button>
        ) : (
          <button
            onClick={() => onAdd(stock)}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-colors"
          >
            + ポートフォリオに追加
          </button>
        )}
      </div>
    </div>
  );
}
