interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'portfolio', label: '📊 ポートフォリオ' },
  { id: 'stocks', label: '🎁 株主優待' },
  { id: 'planner', label: '📅 投資プラン' },
  { id: 'nisa', label: '💡 NISA入門' },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <div>
              <h1 className="text-lg font-bold text-warm-700 leading-tight">株主優待ポートフォリオ</h1>
              <p className="text-xs text-gray-500">はじめての株式投資</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-warm-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-warm-50 hover:text-warm-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Mobile nav */}
        <div className="flex sm:hidden gap-1 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-warm-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-warm-50 hover:text-warm-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
