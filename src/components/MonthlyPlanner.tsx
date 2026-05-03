function formatYen(amount: number): string {
  return amount.toLocaleString('ja-JP') + '円';
}

function buildPlanItems(budget: number) {
  const nisa = Math.round(budget * 0.5);
  const stocks = Math.round(budget * 0.3);
  const cash = budget - nisa - stocks;
  return [
    {
      label: 'つみたてNISA（インデックスファンド）',
      amount: nisa,
      icon: '📈',
      color: 'blue',
      detail: 'eMAXIS Slim 全世界株式（オルカン）を毎月自動積立',
      reason: '長期的な資産形成の柱。手数料が安く、世界の株式市場全体に分散投資。',
      subItems: [
        { name: 'eMAXIS Slim 全世界株式', amount: Math.round(nisa * 0.6), note: 'オルカン' },
        { name: 'eMAXIS Slim 米国株式 S&P500', amount: nisa - Math.round(nisa * 0.6), note: 'S&P500' },
      ],
    },
    {
      label: '個別株・優待株',
      amount: stocks,
      icon: '🎁',
      color: 'orange',
      detail: '気に入った株主優待株を毎月少しずつ購入',
      reason: '楽しみながら投資する部分。100株単位で購入し、優待をもらう。',
      subItems: [
        { name: '優待株A（例：ワタミ）', amount: Math.round(stocks / 2), note: '月〜2ヶ月に1銘柄' },
        { name: '優待株B（例：吉野家）', amount: stocks - Math.round(stocks / 2), note: '積み立て中' },
      ],
    },
    {
      label: '現金バッファー（緊急予備費）',
      amount: cash,
      icon: '🏦',
      color: 'green',
      detail: '高金利普通預金または短期国債MMFに積立',
      reason: '急な出費に備える安心の緊急予備費。生活費3〜6ヶ月分を目標に。',
      subItems: [
        { name: '高金利普通預金', amount: Math.round(cash / 2), note: 'SBI・楽天など' },
        { name: '短期国債・MRF', amount: cash - Math.round(cash / 2), note: '元本確保' },
      ],
    },
  ];
}

const colorMap: Record<string, { bg: string; light: string; text: string; border: string; bar: string }> = {
  blue: {
    bg: 'bg-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    bar: 'bg-blue-400',
  },
  orange: {
    bg: 'bg-orange-400',
    light: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    bar: 'bg-orange-400',
  },
  green: {
    bg: 'bg-green-400',
    light: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    bar: 'bg-green-400',
  },
};

function getProjection(budget: number) {
  const nisa = Math.round(budget * 0.5);
  const stocks = Math.round(budget * 0.3);
  const cash = budget - nisa - stocks;
  const rows = [];
  let indexTotal = 0;
  let stocksTotal = 0;
  let cashTotal = 0;
  for (let m = 1; m <= 12; m++) {
    indexTotal += nisa;
    stocksTotal += stocks;
    cashTotal += cash;
    rows.push({
      month: m,
      index: indexTotal,
      stocks: stocksTotal,
      cash: cashTotal,
      total: indexTotal + stocksTotal + cashTotal,
    });
  }
  return rows;
}

interface MonthlyPlannerProps {
  monthlyBudget?: number;
}

export default function MonthlyPlanner({ monthlyBudget = 100_000 }: MonthlyPlannerProps) {
  const planItems = buildPlanItems(monthlyBudget);
  const projection = getProjection(monthlyBudget);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-4xl">📅</span>
          <div>
            <h2 className="text-xl font-bold">毎月の投資プラン</h2>
            <p className="text-blue-100 text-sm">月{formatYen(monthlyBudget)}を効率よく3つのバケツに分けて運用</p>
          </div>
        </div>
      </div>

      {/* Visual split */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <h3 className="font-bold text-gray-800 mb-4">📊 月{formatYen(monthlyBudget)}の使い道</h3>
        <div className="flex rounded-xl overflow-hidden h-10 mb-4">
          {planItems.map((item) => {
            const c = colorMap[item.color];
            return (
              <div
                key={item.label}
                className={`${c.bg} flex items-center justify-center text-white text-sm font-bold`}
                style={{ width: `${(item.amount / monthlyBudget) * 100}%` }}
              >
                {item.icon} {Math.round((item.amount / monthlyBudget) * 100)}%
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          {planItems.map((item) => {
            const c = colorMap[item.color];
            return (
              <div key={item.label}>
                <p className={`font-bold ${c.text}`}>{formatYen(item.amount)}</p>
                <p className="text-xs text-gray-400">{item.label.split('（')[0]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail cards */}
      <div className="space-y-4">
        {planItems.map((item) => {
          const c = colorMap[item.color];
          return (
            <div key={item.label} className={`bg-white rounded-2xl shadow-sm border ${c.border} overflow-hidden`}>
              <div className={`${c.light} px-5 py-4 border-b ${c.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h4 className={`font-bold ${c.text}`}>{item.label}</h4>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${c.text}`}>{formatYen(item.amount)}</p>
                    <p className="text-xs text-gray-400">/月</p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600 mb-3">{item.reason}</p>
                <div className="space-y-2">
                  {item.subItems.map((sub) => (
                    <div key={sub.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{sub.name}</p>
                        <p className="text-xs text-gray-400">{sub.note}</p>
                      </div>
                      <p className="font-bold text-gray-800">{formatYen(sub.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 12-month projection */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <h3 className="font-bold text-gray-800 mb-4">📈 12ヶ月後の資産予測（積立分のみ）</h3>
        <p className="text-xs text-gray-400 mb-4">※ 運用益・優待価値は含まず、積立元本のみの試算です</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">月</th>
                <th className="text-right py-2 text-blue-600 font-medium">インデックス</th>
                <th className="text-right py-2 text-orange-600 font-medium">優待株</th>
                <th className="text-right py-2 text-green-600 font-medium">現金</th>
                <th className="text-right py-2 text-gray-800 font-bold">合計</th>
              </tr>
            </thead>
            <tbody>
              {projection.map((row) => (
                <tr key={row.month} className={`border-b border-gray-50 ${row.month === 12 ? 'bg-warm-50 font-bold' : ''}`}>
                  <td className="py-1.5 text-gray-600">{row.month}ヶ月目</td>
                  <td className="text-right text-blue-700">{row.index.toLocaleString()}</td>
                  <td className="text-right text-orange-700">{row.stocks.toLocaleString()}</td>
                  <td className="text-right text-green-700">{row.cash.toLocaleString()}</td>
                  <td className="text-right text-gray-900 font-bold">{formatYen(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-warm-50 rounded-xl border border-warm-100">
          <p className="text-sm font-bold text-warm-700">
            🎉 1年間の積立合計: {formatYen(projection[11].total)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            初期投資350万円 + 積立120万円 = 合計470万円スタート。
            インデックスファンドの年平均リターン7%を加えると、さらに増加が期待できます。
          </p>
        </div>
      </div>
    </div>
  );
}
