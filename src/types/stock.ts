export type StockCategory =
  | '食品・飲食'
  | '小売'
  | 'エンタメ'
  | '医薬・ヘルスケア'
  | '金融'
  | '航空・旅行'
  | '通信・IT'
  | '商社・エネルギー'
  | '不動産'
  | 'その他';

export type StockSource = 'kiriya' | 'youtuber' | 'research';

export interface StockBenefit {
  code: string;
  name: string;
  nameEn: string;
  category: StockCategory;
  rightsMonth: number;
  stockPrice: number;
  dividendPerShare: number;
  dividendYield: number;
  minShares: number;
  benefitContent: string;
  benefitIcon: string;
  benefitValue: number;
  otherConditions?: string;
  requiredInvestment: number;
  valueScore: number;
  description: string;
  source: StockSource;
  sourceLabel: string;
}

export interface PortfolioItem {
  stock: StockBenefit;
  lots: number;
}
