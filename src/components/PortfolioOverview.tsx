function formatYen(amount: number): string {
  return amount.toLocaleString('ja-JP') + '円';
}

export default function PortfolioOverview() {
  const totalSavings = 3500000;
  const monthlyBudget = 100000;

  // Recommended allocation
  const indexFundAmount = Math.round(totalSavings * 0.6);
  const stocksAmount = Math.round(totalSavings * 0.3);
  const cashAmount = Math.round(totalSavings * 0.1);

  const allocationData = [
    {
      label: 'インデックスファンド',
      sublabel: 'S&P500・オルカン・TOPIX',
      percent: 60,
      amount: indexFundAmount,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: '📈',
      description: '安定した長期成長の柱',
    },
    {
      label: '配当・優待株',
      sublabel: '株主優待・高配当株',
      percent: 30,
      amount: stocksAmount,
      color: 'bg-orange-400',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      icon: '🎁',
      description: '楽しみながら投資する部分',
    },
    {
      label: '現金・緊急予備費',
      sublabel: 'いつでも引き出せる',
      percent: 10,
      amount: cashAmount,
      color: 'bg-green-400',
      lightColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: '💴',
      description: '万が一の備え',
    },
  ];

  const monthlyPlan = [
    { label: 'つみたてNISA（インデックス）', amount: 50000, color: 'bg-blue-500', icon: '📈' },
    { label: '個別株・優待株', amount: 30000, color: 'bg-orange-400', icon: '🎁' },
    { label: '現金バッファー', amount: 20000, color: 'bg-green-400', icon: '🏦' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-warm-500 to-warm-400 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🌸</span>
          <div>
            <h2 className="text-2xl font-bold mb-1">ようこそ！はじめての株投資</h2>
            <p className="text-warm-100 text-sm leading-relaxed">
              350万円の貯蓄と月10万円の余剰資金を、
              賢く・楽しく運用しましょう。<br />
              桐谷さんのように株主優待を楽しみながら、長期的な資産形成を目指します。
            </p>
          </div>
        </div>
      </div>

      {/* Total Assets Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
          <p className="text-sm text-gray-500 mb-1">💰 運用予定総資産</p>
          <p className="text-3xl font-bold text-warm-700">{formatYen(totalSavings)}</p>
          <p className="text-xs text-gray-400 mt-1">現在の貯蓄額</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
          <p className="text-sm text-gray-500 mb-1">📅 月間投資予算</p>
          <p className="text-3xl font-bold text-warm-700">{formatYen(monthlyBudget)}</p>
          <p className="text-xs text-gray-400 mt-1">毎月の余剰資金</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
          <p className="text-sm text-gray-500 mb-1">🎯 目標スタイル</p>
          <p className="text-xl font-bold text-warm-700">優待＋長期積立</p>
          <p className="text-xs text-gray-400 mt-1">桐谷スタイルで楽しく運用</p>
        </div>
      </div>

      {/* Allocation */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🥧 おすすめポートフォリオ配分</h3>

        {/* Visual bar */}
        <div className="flex rounded-xl overflow-hidden h-8 mb-6">
          {allocationData.map((item) => (
            <div
              key={item.label}
              className={`${item.color} flex items-center justify-center text-white text-sm font-bold transition-all`}
              style={{ width: `${item.percent}%` }}
            >
              {item.percent}%
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {allocationData.map((item) => (
            <div
              key={item.label}
              className={`${item.lightColor} border ${item.borderColor} rounded-xl p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className={`font-bold ${item.textColor}`}>{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sublabel}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{item.percent}%</p>
              <p className={`text-lg font-semibold ${item.textColor}`}>{formatYen(item.amount)}</p>
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Investment Plan */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📅 毎月の投資配分 ({formatYen(monthlyBudget)})</h3>
        <div className="space-y-3">
          {monthlyPlan.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-xl w-8">{item.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-800">{formatYen(item.amount)}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full`}
                    style={{ width: `${(item.amount / monthlyBudget) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-400 w-8 text-right">
                {Math.round((item.amount / monthlyBudget) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-amber-800 mb-3">💡 桐谷流・投資の心得</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '🔰', text: 'まずはNISAでインデックスファンドの積立から始める' },
            { icon: '🎁', text: '株主優待は「生活費の節約」と考えると楽しさが増す' },
            { icon: '📊', text: '個別株は余剰資金の範囲内で、生活に身近な会社から' },
            { icon: '🕰️', text: '長期保有が基本。短期的な値動きに惑わされない' },
          ].map((tip) => (
            <div key={tip.text} className="flex items-start gap-2">
              <span className="text-lg">{tip.icon}</span>
              <p className="text-sm text-amber-900">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
