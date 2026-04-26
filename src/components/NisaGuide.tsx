interface EtfCard {
  name: string;
  code: string;
  type: string;
  expenseRatio: string;
  description: string;
  icon: string;
  recommended: boolean;
}

const etfList: EtfCard[] = [
  {
    name: 'eMAXIS Slim 全世界株式（オール・カントリー）',
    code: '0331418A',
    type: 'つみたて投資枠',
    expenseRatio: '0.057%',
    description: '通称「オルカン」。日本を含む世界49ヶ国・約2,900銘柄に分散投資。初心者に最もおすすめ。',
    icon: '🌍',
    recommended: true,
  },
  {
    name: 'eMAXIS Slim 米国株式（S&P500）',
    code: '0331120A',
    type: 'つみたて投資枠',
    expenseRatio: '0.0815%',
    description: '米国の代表的500社に投資。Apple・Microsoft・Googleなど有名企業が中心。長期リターンが高い。',
    icon: '🇺🇸',
    recommended: true,
  },
  {
    name: 'eMAXIS Slim 国内株式（TOPIX）',
    code: '0331116A',
    type: 'つみたて投資枠',
    expenseRatio: '0.143%',
    description: '東京証券取引所プライム市場の全銘柄に投資。日本株式市場全体をカバー。',
    icon: '🗾',
    recommended: false,
  },
  {
    name: '上場インデックスファンド米国株式（S&P500）',
    code: '1547',
    type: '成長投資枠',
    expenseRatio: '0.077%',
    description: 'ETF（上場投資信託）形式のS&P500連動商品。リアルタイムで売買可能。',
    icon: '📊',
    recommended: false,
  },
];

const nisaFacts = [
  {
    title: 'NISAとは？',
    content: 'NISA（ニーサ）は「少額投資非課税制度」の略です。通常、株や投資信託で利益が出ると約20%の税金がかかりますが、NISA口座で投資すると利益が非課税（税金ゼロ）になります。',
    icon: '🆓',
  },
  {
    title: '2つの投資枠',
    content: '①「つみたて投資枠」：毎月コツコツ積立投資（年120万円まで）\n②「成長投資枠」：個別株や一般投信に投資（年240万円まで）\n合計年間360万円まで非課税で投資できます。',
    icon: '📦',
  },
  {
    title: '非課税保有期間',
    content: '新NISAは非課税期間が無期限！昔のNISAは5〜20年の制限がありましたが、2024年からの新NISAは一生涯非課税で保有できます。',
    icon: '♾️',
  },
  {
    title: '生涯投資枠',
    content: '生涯で最大1,800万円まで（うち成長投資枠1,200万円）非課税で投資できます。売却した分の枠は翌年以降に復活します。',
    icon: '💎',
  },
];

const steps = [
  { step: 1, title: 'NISA口座を開設する', detail: 'SBI証券・楽天証券などのネット証券で無料開設。マイナンバーカードがあればスマホで完結。', icon: '🏦' },
  { step: 2, title: 'つみたて投資枠の設定', detail: 'eMAXIS Slim オルカンまたはS&P500を選び、毎月自動積立を設定。50,000円/月から始めよう。', icon: '⚙️' },
  { step: 3, title: '成長投資枠で優待株購入', detail: 'NISA口座の成長投資枠で株主優待株を購入。利益も配当も非課税になる。', icon: '🎁' },
  { step: 4, title: 'あとは待つだけ！', detail: '毎月自動積立されるので、相場を気にせず長期保有。定期的にポートフォリオを確認する程度でOK。', icon: '😊' },
];

export default function NisaGuide() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-4xl">💡</span>
          <div>
            <h2 className="text-xl font-bold">NISA入門ガイド</h2>
            <p className="text-purple-100 text-sm">投資初心者のための「税金ゼロ」投資制度をわかりやすく解説</p>
          </div>
        </div>
      </div>

      {/* NISA facts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nisaFacts.map((fact) => (
          <div key={fact.title} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{fact.icon}</span>
              <h4 className="font-bold text-purple-800">{fact.title}</h4>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{fact.content}</p>
          </div>
        ))}
      </div>

      {/* 2024 NISA summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <h3 className="font-bold text-gray-800 mb-4">📋 新NISA（2024年〜）早見表</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left px-4 py-3 text-purple-800 rounded-l-lg">項目</th>
                <th className="text-center px-4 py-3 text-blue-700">つみたて投資枠</th>
                <th className="text-center px-4 py-3 text-orange-700 rounded-r-lg">成長投資枠</th>
              </tr>
            </thead>
            <tbody>
              {[
                { item: '年間投資上限', tsumitate: '120万円', seichou: '240万円' },
                { item: '投資対象', tsumitate: '積立投信（金融庁指定）', seichou: '株・ETF・投信' },
                { item: '非課税期間', tsumitate: '無期限', seichou: '無期限' },
                { item: '生涯上限（合算）', tsumitate: '1,800万円', seichou: '1,200万円' },
                { item: '投資スタイル', tsumitate: '毎月コツコツ自動', seichou: '自由に購入' },
              ].map((row) => (
                <tr key={row.item} className="border-b border-gray-50">
                  <td className="px-4 py-2 text-gray-600 font-medium">{row.item}</td>
                  <td className="px-4 py-2 text-center text-blue-700">{row.tsumitate}</td>
                  <td className="px-4 py-2 text-center text-orange-700">{row.seichou}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended ETFs */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <h3 className="font-bold text-gray-800 mb-4">🏆 おすすめインデックスファンド・ETF</h3>
        <div className="space-y-3">
          {etfList.map((etf) => (
            <div
              key={etf.code}
              className={`rounded-xl p-4 border ${
                etf.recommended
                  ? 'border-purple-200 bg-purple-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{etf.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-sm ${etf.recommended ? 'text-purple-800' : 'text-gray-700'}`}>
                        {etf.name}
                      </p>
                      {etf.recommended && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium border border-yellow-200">
                          ⭐ おすすめ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{etf.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                    etf.type === 'つみたて投資枠' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {etf.type}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">信託報酬 {etf.expenseRatio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <h3 className="font-bold text-gray-800 mb-4">🚀 今すぐ始める4ステップ</h3>
        <div className="space-y-3">
          {steps.map((s) => (
            <div key={s.step} className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {s.step}
              </div>
              <div className="flex-1 pb-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <p className="font-bold text-gray-800">{s.title}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key points */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
        <h3 className="font-bold text-green-800 mb-3">✅ 投資の大切な心得</h3>
        <ul className="space-y-2">
          {[
            '余裕資金のみで投資する（生活費は手をつけない）',
            '長期・分散・積立が投資の基本三原則',
            '毎月コツコツが最強。タイミングを計ろうとしない',
            '下がっても慌てない。長期で見れば回復してきた歴史がある',
            '手数料（信託報酬）の低いファンドを選ぶ',
          ].map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-green-900">
              <span className="text-green-500 font-bold mt-0.5">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
