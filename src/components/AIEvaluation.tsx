import { useState } from 'react';
import type { PortfolioItem, StockCategory } from '../types/stock';

interface AIEvaluationProps {
  items: PortfolioItem[];
  totalInvestment: number;
}

interface RuleBasedResult {
  totalScore: number;
  diversificationScore: number;
  yieldScore: number;
  benefitScore: number;
  budgetScore: number;
  diversificationDetail: string;
  yieldGrade: string;
  yieldDetail: string;
  benefitDetail: string;
  riskWarnings: string[];
  suggestions: string[];
  categoryBreakdown: { category: string; count: number; pct: number }[];
}

const LS_CLAUDE_API_KEY = 'kabu_claude_api_key';

function loadApiKey(): string {
  try { return localStorage.getItem(LS_CLAUDE_API_KEY) ?? ''; } catch { return ''; }
}

function saveApiKey(key: string) {
  try { localStorage.setItem(LS_CLAUDE_API_KEY, key); } catch { /* ignore */ }
}

function calcRuleBased(items: PortfolioItem[], totalInvestment: number): RuleBasedResult {
  const totalDividend = items.reduce(
    (s, i) => s + i.stock.dividendPerShare * i.stock.minShares * i.lots, 0
  );
  const totalBenefit = items.reduce((s, i) => s + i.stock.benefitValue * i.lots, 0);
  const effectiveYield = totalInvestment > 0
    ? ((totalDividend + totalBenefit) / totalInvestment) * 100 : 0;

  // Category breakdown
  const catMap = new Map<StockCategory, number>();
  for (const item of items) {
    catMap.set(item.stock.category, (catMap.get(item.stock.category) ?? 0) + 1);
  }
  const total = items.length;
  const categoryBreakdown = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count, pct: (count / total) * 100 }));

  const uniqueCats = catMap.size;
  const maxCatPct = categoryBreakdown[0]?.pct ?? 0;

  // Diversification score (0-30)
  let diversificationScore = 0;
  if (uniqueCats >= 6) diversificationScore = 30;
  else if (uniqueCats >= 4) diversificationScore = 22;
  else if (uniqueCats >= 3) diversificationScore = 15;
  else if (uniqueCats >= 2) diversificationScore = 8;
  else diversificationScore = 2;
  if (maxCatPct > 50) diversificationScore = Math.max(0, diversificationScore - 10);

  const diversificationDetail =
    `${uniqueCats}カテゴリに分散（最大: ${categoryBreakdown[0]?.category ?? '-'} ${maxCatPct.toFixed(0)}%）` +
    (maxCatPct > 50 ? ' ⚠️ 1カテゴリに集中しすぎ' : ' ✅ バランス良好');

  // Yield score (0-25)
  let yieldScore = 0;
  let yieldGrade = 'D';
  let yieldDetail = '';
  if (effectiveYield > 5) { yieldScore = 25; yieldGrade = 'A'; yieldDetail = '優秀！実質利回り5%超の高配当ポートフォリオです。'; }
  else if (effectiveYield >= 3) { yieldScore = 18; yieldGrade = 'B'; yieldDetail = '良好。配当利回り3〜5%の安定したポートフォリオです。'; }
  else if (effectiveYield >= 2) { yieldScore = 10; yieldGrade = 'C'; yieldDetail = '普通。利回り2〜3%です。高配当株を追加すると改善できます。'; }
  else { yieldScore = 4; yieldGrade = 'D'; yieldDetail = '低め。利回り2%未満です。配当重視の銘柄追加を検討しましょう。'; }

  // Benefit score (0-25)
  const benefitStocksCount = items.filter(i => i.stock.benefitValue > 0).length;
  const avgBenefit = total > 0 ? (totalBenefit / total) : 0;
  let benefitScore = 0;
  if (avgBenefit >= 5000) benefitScore = 25;
  else if (avgBenefit >= 3000) benefitScore = 18;
  else if (avgBenefit >= 1500) benefitScore = 12;
  else benefitScore = 5;
  const benefitDetail =
    `優待あり銘柄: ${benefitStocksCount}/${total}銘柄、年間優待合計: ${Math.round(totalBenefit).toLocaleString('ja-JP')}円、平均: ${Math.round(avgBenefit).toLocaleString('ja-JP')}円`;

  // Budget score (0-20)
  let budgetScore = 0;
  try {
    const raw = localStorage.getItem('kabu_initial_budget');
    const budget = raw ? parseInt(raw, 10) : 3_500_000;
    const ratio = totalInvestment / budget;
    if (ratio >= 0.5 && ratio <= 1.0) budgetScore = 20;
    else if (ratio >= 0.3 && ratio < 0.5) budgetScore = 13;
    else if (ratio > 1.0) budgetScore = 8;
    else budgetScore = 5;
  } catch { budgetScore = 10; }

  // Risk warnings
  const riskWarnings: string[] = [];
  if (maxCatPct > 50) {
    riskWarnings.push(`⚠️ 「${categoryBreakdown[0]?.category}」に${maxCatPct.toFixed(0)}%集中しています。他カテゴリも検討してください。`);
  }

  // Check single stock concentration
  for (const item of items) {
    const investmentRatio = (item.stock.stockPrice * item.stock.minShares * item.lots) / totalInvestment * 100;
    if (investmentRatio > 20) {
      riskWarnings.push(`⚠️ 「${item.stock.name}」が投資額の${investmentRatio.toFixed(0)}%を占めています（推奨: 20%以下）。`);
    }
  }

  const volatileCategories = ['エンタメ', '通信・IT', '商社・エネルギー'] as StockCategory[];
  const volatileCount = items.filter(i => volatileCategories.includes(i.stock.category)).length;
  if (volatileCount / total > 0.4) {
    riskWarnings.push('⚠️ 景気敏感・高ボラティリティ銘柄が多めです。生活必需品系の安定株とのバランスを考慮しましょう。');
  }

  if (riskWarnings.length === 0) {
    riskWarnings.push('✅ 現時点で大きなリスク集中は見られません。');
  }

  // Suggestions
  const suggestions: string[] = [];

  if (uniqueCats < 4) {
    suggestions.push('📌 カテゴリを4種類以上に分散させましょう。食品・金融・不動産・通信など異なる業種を組み合わせると景気変動に強くなります。');
  }
  if (effectiveYield < 3) {
    suggestions.push('📌 配当利回り3%以上の高配当株（三菱UFJ FG、KDDI、JTなど）を追加すると実質利回りが向上します。');
  }
  if (benefitStocksCount < total * 0.5) {
    suggestions.push('📌 株主優待のある銘柄を増やしましょう。食事券・買物券系の優待は日常生活に直結してお得感を実感できます。');
  }
  if (items.length < 5) {
    suggestions.push('📌 銘柄数が少なめです。最低5〜10銘柄に分散すると個別銘柄のリスクを下げられます。');
  }
  if (items.length > 15) {
    suggestions.push('📌 銘柄数が多くなっています。管理のしやすさのため、まずは10〜15銘柄に絞り込み、慣れてきたら増やすのもよいでしょう。');
  }

  // Sector-specific suggestions
  const hasFood = catMap.has('食品・飲食');
  const hasFinance = catMap.has('金融');
  if (!hasFood) suggestions.push('📌 「食品・飲食」カテゴリの銘柄がありません。すかいらーく・吉野家など食事券優待が充実する銘柄は初心者におすすめです。');
  if (!hasFinance) suggestions.push('📌 「金融」カテゴリの銘柄がありません。三菱UFJ FGや東京海上HDのような高配当金融株はポートフォリオを安定させます。');

  const totalScore = diversificationScore + yieldScore + benefitScore + budgetScore;

  return {
    totalScore,
    diversificationScore,
    yieldScore,
    benefitScore,
    budgetScore,
    diversificationDetail,
    yieldGrade,
    yieldDetail,
    benefitDetail,
    riskWarnings,
    suggestions: suggestions.slice(0, 5),
    categoryBreakdown,
  };
}

function buildPrompt(items: PortfolioItem[], totalInvestment: number): string {
  const totalDividend = items.reduce(
    (s, i) => s + i.stock.dividendPerShare * i.stock.minShares * i.lots, 0
  );
  const totalBenefit = items.reduce((s, i) => s + i.stock.benefitValue * i.lots, 0);
  const effectiveYield = totalInvestment > 0
    ? ((totalDividend + totalBenefit) / totalInvestment) * 100 : 0;

  const catMap = new Map<string, number>();
  for (const item of items) {
    catMap.set(item.stock.category, (catMap.get(item.stock.category) ?? 0) + 1);
  }

  const stockList = items.map(i =>
    `- ${i.stock.name}（${i.stock.code}）: 株価${i.stock.stockPrice}円, 配当${i.stock.dividendPerShare}円/株, 優待${i.stock.benefitValue}円/年, カテゴリ:${i.stock.category}`
  ).join('\n');

  const catStr = Array.from(catMap.entries()).map(([c, n]) => `${c}: ${n}銘柄`).join(', ');

  return `あなたは日本株の株主優待投資の専門家です。以下のポートフォリオを日本語で詳しく評価してください。初心者向けにわかりやすく説明してください。

## ポートフォリオ概要
- 銘柄数: ${items.length}銘柄
- 必要投資額合計: ${Math.round(totalInvestment).toLocaleString('ja-JP')}円
- 年間配当金合計: ${Math.round(totalDividend).toLocaleString('ja-JP')}円
- 年間優待金額合計: ${Math.round(totalBenefit).toLocaleString('ja-JP')}円
- 実質利回り（配当+優待）: ${effectiveYield.toFixed(2)}%
- カテゴリ分布: ${catStr}

## 保有銘柄一覧
${stockList}

## 評価してほしい項目
1. このポートフォリオの良い点（2〜3点）
2. 改善できる点・注意点（2〜3点）
3. 初心者へのアドバイス（3点）
4. このポートフォリオの総合評価（100点満点でスコアと一言コメント）

日本語で、親しみやすく丁寧に回答してください。`;
}

export default function AIEvaluation({ items, totalInvestment }: AIEvaluationProps) {
  const [apiKey, setApiKey] = useState<string>(loadApiKey);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [sectionOpen, setSectionOpen] = useState(true);

  const ruleResult = calcRuleBased(items, totalInvestment);
  const scoreColor =
    ruleResult.totalScore >= 75 ? 'text-green-600' :
    ruleResult.totalScore >= 50 ? 'text-orange-500' : 'text-red-500';

  const scoreLabel =
    ruleResult.totalScore >= 75 ? '優良ポートフォリオ' :
    ruleResult.totalScore >= 50 ? '標準的なポートフォリオ' : '改善の余地あり';

  async function runAIEvaluation() {
    if (!apiKey.trim()) return;
    setLoading(true);
    setAiResult(null);
    setAiError(null);
    saveApiKey(apiKey.trim());

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          messages: [{ role: 'user', content: buildPrompt(items, totalInvestment) }],
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({})) as { error?: { message?: string } };
        const msg = errJson?.error?.message ?? `APIエラー (${resp.status})`;
        setAiError(`エラー: ${msg}`);
        return;
      }

      const data = await resp.json() as { content?: { type: string; text: string }[] };
      const text = data?.content?.[0]?.text ?? '';
      if (!text) {
        setAiError('AIからの応答が空でした。');
        return;
      }
      setAiResult(text);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '不明なエラー';
      setAiError(`通信エラー: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-warm-100 overflow-hidden">
      <button
        onClick={() => setSectionOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-warm-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="font-bold text-gray-800 text-base">ポートフォリオ評価</h3>
            <p className="text-xs text-gray-500">ルールベース評価 + Claude AI評価</p>
          </div>
        </div>
        <span className="text-gray-400 text-xs">{sectionOpen ? '▲ 閉じる' : '▼ 開く'}</span>
      </button>

      {sectionOpen && (
        <div className="px-4 pb-6 space-y-5 border-t border-warm-100">
          {/* Total score */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 pb-2 border-b border-gray-100">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 font-medium mb-1">総合スコア</p>
              <p className={`text-5xl font-black ${scoreColor}`}>{ruleResult.totalScore}</p>
              <p className="text-xs text-gray-400">/ 100</p>
            </div>
            <div className="flex-1">
              <p className={`text-base font-bold mb-1 ${scoreColor}`}>{scoreLabel}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: '分散度', score: ruleResult.diversificationScore, max: 30 },
                  { label: '配当利回り', score: ruleResult.yieldScore, max: 25 },
                  { label: '優待充実度', score: ruleResult.benefitScore, max: 25 },
                  { label: '予算適合度', score: ruleResult.budgetScore, max: 20 },
                ].map(({ label, score, max }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-500">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{score}<span className="text-xs text-gray-400">/{max}</span></p>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                      <div
                        className="h-full bg-orange-400 rounded-full"
                        style={{ width: `${(score / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">📂 カテゴリ分布</h4>
            <div className="space-y-1.5">
              {ruleResult.categoryBreakdown.map(({ category, count, pct }) => (
                <div key={category} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-28 shrink-0">{category}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-300 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right shrink-0">{count}銘柄 {pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">{ruleResult.diversificationDetail}</p>
          </div>

          {/* Yield evaluation */}
          <div className="bg-green-50 rounded-xl p-3">
            <h4 className="text-sm font-bold text-gray-700 mb-1">
              📈 配当利回り評価: <span className="text-green-600">グレード {ruleResult.yieldGrade}</span>
            </h4>
            <p className="text-xs text-gray-600">{ruleResult.yieldDetail}</p>
          </div>

          {/* Benefit evaluation */}
          <div className="bg-amber-50 rounded-xl p-3">
            <h4 className="text-sm font-bold text-gray-700 mb-1">🎁 優待充実度</h4>
            <p className="text-xs text-gray-600">{ruleResult.benefitDetail}</p>
          </div>

          {/* Risk warnings */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">⚡ リスク評価</h4>
            <ul className="space-y-1">
              {ruleResult.riskWarnings.map((w, idx) => (
                <li key={idx} className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{w}</li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">💡 改善提案</h4>
            <ul className="space-y-2">
              {ruleResult.suggestions.map((s, idx) => (
                <li key={idx} className="text-xs text-gray-700 bg-blue-50 rounded-lg px-3 py-2 leading-relaxed">{s}</li>
              ))}
            </ul>
          </div>

          {/* Claude AI section */}
          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
              <span>🤖</span> Claude AIで詳細評価
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              AnthropicのAPIキーを入力すると、AIがあなたのポートフォリオを詳しく分析します（キーはブラウザのみに保存）
            </p>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 pr-10"
                />
                <button
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  aria-label={showKey ? 'APIキーを隠す' : 'APIキーを表示'}
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
              <button
                onClick={runAIEvaluation}
                disabled={!apiKey.trim() || loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                {loading ? '分析中...' : 'AI評価を実行'}
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-purple-600 text-sm py-3">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Claude AIが分析中です。少々お待ちください...</span>
              </div>
            )}

            {aiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {aiError}
              </div>
            )}

            {aiResult && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🤖</span>
                  <p className="font-bold text-purple-800 text-sm">Claude AIによるポートフォリオ分析</p>
                </div>
                <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {aiResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
