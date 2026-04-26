export type StockCategory =
  | '食品・飲食'
  | '小売'
  | 'エンタメ'
  | '医薬・ヘルスケア'
  | '金融'
  | '航空・旅行';

export interface StockBenefit {
  code: string;
  name: string;
  nameEn: string;
  category: StockCategory;
  rightsMonth: number; // 権利確定月
  stockPrice: number; // 株価（円）
  dividendPerShare: number; // 一株配当（円）
  dividendYield: number; // 配当利回り（%）
  minShares: number; // 優待発生株数
  benefitContent: string; // 優待内容
  benefitIcon: string; // emoji icon
  benefitValue: number; // 優待の金額換算（円）
  otherConditions?: string; // その他条件
  requiredInvestment: number; // 必要投資額
  valueScore: number; // お得度 1-5
  description: string; // brief description
}
