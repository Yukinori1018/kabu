/**
 * 株価自動更新スクリプト
 * GitHub Actions から毎週月曜に実行される
 * stooq.com → Yahoo Finance の順でフォールバックしながら最新株価を取得する
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

// stooq.com から取得（日本株は XXXX.jp 形式）
async function fetchFromStooq(code) {
  const symbol = `${code}.jp`;
  const url = `https://stooq.com/q/l/?s=${symbol}&f=sd2t2ohlcv&h&e=csv`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.log(`    stooq HTTP ${res.status} for ${code}`);
      return null;
    }
    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      console.log(`    stooq 行数不足 for ${code}: ${JSON.stringify(text.substring(0, 100))}`);
      return null;
    }
    const cols = lines[1].split(',');
    // フォーマット: Symbol,Date,Time,Open,High,Low,Close,Volume → Close は index 6
    const close = parseFloat(cols[6]);
    if (!close || close <= 0 || isNaN(close)) {
      console.log(`    stooq 価格不正 for ${code}: ${cols[6]}`);
      return null;
    }
    return Math.round(close);
  } catch (e) {
    console.log(`    stooq 例外 for ${code}: ${e.message}`);
    return null;
  }
}

// Yahoo Finance v8 からフォールバック取得
async function fetchFromYahoo(code) {
  const symbol = `${code}.T`;
  // v8 と v10 の両方を試す
  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'ja,en;q=0.9',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price && price > 0) return Math.round(price);
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchPrice(code) {
  const stooq = await fetchFromStooq(code);
  if (stooq) return { price: stooq, source: 'stooq' };

  await new Promise(r => setTimeout(r, 300));

  const yahoo = await fetchFromYahoo(code);
  if (yahoo) return { price: yahoo, source: 'yahoo' };

  return null;
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

  // 接続確認（stooq の到達可能性テスト）
  console.log('接続テスト中...');
  try {
    const testRes = await fetch('https://stooq.com/', { signal: AbortSignal.timeout(8000) });
    console.log(`stooq.com 到達: HTTP ${testRes.status}`);
  } catch (e) {
    console.log(`stooq.com 到達不可: ${e.message}`);
  }

  const prices = { ...existing };
  let updated = 0;
  let failed = 0;
  let stooqCount = 0;
  let yahooCount = 0;

  console.log(`\n${STOCK_CODES.length}銘柄の株価を取得中...`);

  for (const code of STOCK_CODES) {
    const result = await fetchPrice(code);
    if (result) {
      const prev = existing[code];
      prices[code] = result.price;
      if (result.source === 'stooq') stooqCount++;
      else yahooCount++;
      if (prev !== result.price) {
        console.log(`  ${code}: ${prev ? `${prev}円 → ` : ''}${result.price}円 [${result.source}]`);
        updated++;
      }
    } else {
      failed++;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  const today = new Date().toISOString().split('T')[0];
  const successCount = stooqCount + yahooCount;
  const output = {
    lastUpdated: today,
    source: successCount > 0
      ? `stooq.com ${stooqCount}件 / Yahoo Finance ${yahooCount}件 (自動取得)`
      : '自動取得失敗 - 前回データを使用',
    note: '毎週月曜に自動更新。株価は参考値です。投資判断は必ず最新情報でご確認ください。',
    prices,
  };

  mkdirSync(dirname(PRICES_FILE), { recursive: true });
  writeFileSync(PRICES_FILE, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\n完了: ${updated}銘柄を更新、${failed}銘柄は取得失敗（既存値を維持）`);
  console.log(`データソース: stooq ${stooqCount}件、Yahoo ${yahooCount}件`);
  console.log(`更新日: ${today}`);

  // 失敗しても exit 0 でワークフローを継続させる（デプロイは必ず実行）
  // 取得状況は上記ログで確認できる
}

main().catch((err) => {
  console.error('スクリプトエラー:', err);
  // エラー時も exit 0 でデプロイは継続
  process.exit(0);
});
