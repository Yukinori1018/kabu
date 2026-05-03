interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  portfolioCount?: number;
}

const tabs = [
  { id: 'myportfolio', label: '🛒 マイポートフォリオ' },
  { id: 'stocks', label: '📋 銘柄' },
  { id: 'portfolio', label: '📊 配分プラン' },
  { id: 'planner', label: '📅 投資プラン' },
  { id: 'nisa', label: '💡 NISA入門' },
];

export default function Header({ activeTab, onTabChange, portfolioCount = 0 }: HeaderProps) {
  const renderTabButton = (tab: { id: string; label: string }, mobile: boolean) => {
    const isActive = activeTab === tab.id;
    const showBadge = tab.id === 'myportfolio' && portfolioCount > 0;
    const baseClass = mobile
      ? 'relative px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all'
      : 'relative px-3 py-2 rounded-lg text-sm font-medium transition-all';
    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`${baseClass} ${
          isActive
            ? 'bg-warm-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-warm-50 hover:text-warm-700'
        }`}
      >
        {tab.label}
        {showBadge && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow">
            {portfolioCount}
          </span>
        )}
      </button>
    );
  };

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
            {tabs.map((tab) => renderTabButton(tab, false))}
          </div>
        </div>
        {/* Mobile nav */}
        <div className="flex sm:hidden gap-1 pb-2 overflow-x-auto">
          {tabs.map((tab) => renderTabButton(tab, true))}
        </div>
      </div>
    </header>
  );
}
