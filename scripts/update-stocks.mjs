/**
 * 株価自動更新スクリプト
 * GitHub Actions から毎週月曜に実行される
 * Yahoo Finance Japan から最新株価を取得して public/data/prices.json を更新する
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRICES_FILE = join(__dirname, '../public/data/prices.json');

// 全対象銘柄コード（東証）
const STOCK_CODES = [
  '3197','2702','3543','9861','7522','3397','8267','3048','9831','8591',
  '9202','9433','9432','2914','3151','2503','7550','8153','4661','7832',
  '3088','3391','8306','8316','8001','8058','9434','4502','5020','6178',
  '1928','1925','5108','3087','3547','7630','2897','2811','2502','2501',
  '2802','3086','3099','8233','8905','9602','9601','4816','9201','8439',
  '7751','6752','8200','7611','3193','8179','3091','9850','9979','8160',
  '3133','9900','9843','3382','2681','7649','3141','9697','9684','7974',
  '9722','9616','9020','9022','9021','9007','9708','8766','8630','8750',
  '8304','8002','8053','8015','5019','7203','6758','7267','6501','6503',
  '6301','4063','6367','3407','4751','6098','4684','6702','4519','4578',
  '3148','8801',
];

async function fetchPrice(code) {
  const symbol = `${code}.T`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StockUpdater/1.0)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price && price > 0 ? Math.round(price) : null;
  } catch {
    return null;
  }
}

async function main() {
  // 既存ファイルを読み込む（フォールバック用）
  let existing = {};
  try {
    const raw = readFileSync(PRICES_FILE, 'utf8');
    existing = JSON.parse(raw).prices || {};
  } catch {
    console.log('既存の prices.json が見つかりません。新規作成します。');
  }

  const prices = { ...existing };
  let updated = 0;
  let failed = 0;

  console.log(`${STOCK_CODES.length}銘柄の株価を取得中...`);

  for (const code of STOCK_CODES) {
    const price = await fetchPrice(code);
    if (price && price > 0) {
      const prev = existing[code];
      prices[code] = price;
      if (prev !== price) {
        console.log(`  ${code}: ${prev ? `${prev}円 → ` : ''}${price}円`);
        updated++;
      }
    } else {
      console.log(`  ${code}: 取得失敗（既存値 ${existing[code] ?? 'なし'} を維持）`);
      failed++;
    }
    // レートリミット対策
    await new Promise(r => setTimeout(r, 150));
  }

  const today = new Date().toISOString().split('T')[0];
  const output = {
    lastUpdated: today,
    source: 'Yahoo Finance Japan (自動取得)',
    note: '毎週月曜に自動更新。株価は参考値です。投資判断は必ず最新情報でご確認ください。',
    prices,
  };

  mkdirSync(dirname(PRICES_FILE), { recursive: true });
  writeFileSync(PRICES_FILE, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\n完了: ${updated}銘柄を更新、${failed}銘柄は取得失敗（既存値を維持）`);
  console.log(`更新日: ${today}`);
}

main().catch((err) => {
  console.error('エラー:', err);
  process.exit(1);
});
