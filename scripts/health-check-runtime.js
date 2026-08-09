#!/usr/bin/env node
/**
 * 全ツールのランタイムヘルスチェック
 *
 * 各 URL に HTTP リクエストを送り、
 *   1. 200 + HTML が返ること
 *   2. その HTML が参照する JS/CSS が実際に取得できること
 * を確認する。
 *
 * 2 が重要。アセットパスが壊れていても HTML 自体は 200 + text/html で正常に返るため、
 * 1 だけでは全アプリ白画面でも「正常」と報告してしまう（実際に空振りした実績あり）。
 * 詳細: .docs/ASSET_PATH_INCIDENT.md
 *
 * 使用方法:
 *   node scripts/health-check-runtime.js [--concurrency=N] [--base-url=URL] [--timeout=MS]
 *
 * 例:
 *   node scripts/health-check-runtime.js
 *   node scripts/health-check-runtime.js --concurrency=20 --base-url=http://localhost:8787
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const args = process.argv.slice(2);
const CONCURRENCY = parseInt(
  args.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? "10",
);
const BASE_URL =
  args.find((a) => a.startsWith("--base-url="))?.split("=")[1] ?? "https://tools.elchika.app";
const TIMEOUT_MS = parseInt(args.find((a) => a.startsWith("--timeout="))?.split("=")[1] ?? "10000");

/** packages/router/public/ 配下のディレクトリ一覧 = デプロイ済みアプリ */
function getDeployedApps() {
  const publicDir = path.join(__dirname, "..", "packages", "router", "public");
  return fs
    .readdirSync(publicDir)
    .filter((name) => fs.statSync(path.join(publicDir, name)).isDirectory())
    .filter((name) => name !== "fonts")
    .sort();
}

/**
 * HTTP(S) GET を Promise でラップ
 * discardBody: true にするとボディを読み捨てる（アセットは status と content-type だけ見れば十分なため）
 */
function fetchUrl(url, { discardBody = false } = {}) {
  return new Promise((resolve) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { timeout: TIMEOUT_MS }, (res) => {
      const meta = { status: res.statusCode, contentType: res.headers["content-type"] ?? "" };
      if (discardBody) {
        res.resume(); // ボディを捨てつつソケットを解放する
        res.on("end", () => resolve({ ...meta, body: "" }));
        return;
      }
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => resolve({ ...meta, body }));
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: null, contentType: "", body: "", error: "timeout" });
    });
    req.on("error", (err) =>
      resolve({ status: null, contentType: "", body: "", error: err.message }),
    );
  });
}

/** HTML から JS/CSS の参照を取り出す */
function extractAssetRefs(html) {
  return [...html.matchAll(/(?:src|href)="([^"]*\.(?:js|css))"/g)].map((m) => m[1]);
}

/** 参照を絶対 URL に解決する */
function resolveAssetUrl(ref, appName) {
  if (/^https?:\/\//.test(ref)) return ref;
  if (ref.startsWith("/")) return `${BASE_URL}${ref}`;
  return `${BASE_URL}/${appName}/${ref.replace(/^\.\//, "")}`;
}

/**
 * HTML が参照する JS/CSS を実際に取得して検証する。
 * 200 でも content-type が HTML なら実体が無い（フォールバックで index.html が返っている）とみなす。
 */
async function checkAssets(appName, html) {
  const issues = [];
  const refs = extractAssetRefs(html);

  if (refs.length === 0) {
    issues.push("HTML が JS/CSS を 1 つも参照していない（ビルド不全の可能性）");
    return issues;
  }

  for (const ref of refs) {
    const assetUrl = resolveAssetUrl(ref, appName);
    const res = await fetchUrl(assetUrl, { discardBody: true });

    if (res.error) {
      issues.push(`アセット取得失敗 ${ref}: ${res.error}`);
      continue;
    }
    if (res.status !== 200) {
      issues.push(`アセット ${ref} が HTTP ${res.status}`);
      continue;
    }
    if (!/javascript|ecmascript|css/i.test(res.contentType)) {
      issues.push(
        `アセット ${ref} は 200 だが Content-Type: ${res.contentType}（実体が無い可能性）`,
      );
    }
  }

  return issues;
}

/** レスポンスが正常 HTML かチェック */
function diagnose(appName, res) {
  const issues = [];

  if (res.error) {
    issues.push(`リクエスト失敗: ${res.error}`);
    return { ok: false, issues };
  }
  if (res.status !== 200) {
    issues.push(`HTTP ${res.status} (200 expected)`);
  }
  if (!res.contentType.includes("text/html")) {
    issues.push(`Content-Type: ${res.contentType} (text/html expected)`);
  }
  if (res.status === 200 && res.body && !res.body.includes("<html")) {
    issues.push("レスポンスボディに <html> が含まれない");
  }

  // JSON が返ってきた場合（ルーター 404 ハンドラー）
  if (res.contentType.includes("application/json")) {
    try {
      const json = JSON.parse(res.body);
      if (json.error) issues.push(`JSONエラー: ${json.error}`);
    } catch {}
  }

  return { ok: issues.length === 0, issues };
}

/** 並列実行 (concurrency 制限付き) */
async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

async function main() {
  const apps = getDeployedApps();
  console.log(`\n🔍 ヘルスチェック開始: ${apps.length} アプリ`);
  console.log(`   BASE_URL: ${BASE_URL}`);
  console.log(`   CONCURRENCY: ${CONCURRENCY}`);
  console.log(`   TIMEOUT: ${TIMEOUT_MS}ms\n`);

  const startTime = Date.now();
  let completed = 0;

  const tasks = apps.map((appName) => async () => {
    const url = `${BASE_URL}/${appName}/`;
    const res = await fetchUrl(url);
    const { issues } = diagnose(appName, res);

    // HTML が取得できたときだけ、その HTML が参照するアセットまで実際に取りにいく。
    // HTML が 200 でもここで 404 が出れば白画面。1 段目だけでは検知できない。
    if (!res.error && res.status === 200 && res.body) {
      issues.push(...(await checkAssets(appName, res.body)));
    }
    const ok = issues.length === 0;

    completed++;
    if (!ok) {
      process.stdout.write(`\r❌ ${appName}: ${issues.join(", ")}\n`);
    } else {
      process.stdout.write(`\r✅ ${completed}/${apps.length} 完了 (直近OK: ${appName})       `);
    }
    return { appName, url, ok, issues, status: res.status, contentType: res.contentType };
  });

  const results = await runWithConcurrency(tasks, CONCURRENCY);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const ok = results.filter((r) => r.ok);
  const ng = results.filter((r) => !r.ok);

  console.log(`\n\n${"═".repeat(60)}`);
  console.log(`📊 ヘルスチェック結果 (${elapsed}s)`);
  console.log(`${"═".repeat(60)}`);
  console.log(`✅ 正常: ${ok.length} / ${apps.length}`);
  console.log(`❌ 異常: ${ng.length} / ${apps.length}`);

  if (ng.length > 0) {
    console.log(`\n${"─".repeat(60)}`);
    console.log("❌ 異常なアプリ一覧:");
    console.log(`${"─".repeat(60)}`);
    for (const r of ng) {
      console.log(`\n  ${r.appName}`);
      console.log(`  URL: ${r.url}`);
      console.log(`  HTTP: ${r.status ?? "N/A"}  Content-Type: ${r.contentType || "N/A"}`);
      for (const issue of r.issues) {
        console.log(`  ⚠️  ${issue}`);
      }
    }
  }

  console.log(`\n${"═".repeat(60)}\n`);

  // JSON サマリーをファイル出力
  const outPath = path.join(__dirname, "..", ".docs", "health-check-result.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        baseUrl: BASE_URL,
        total: apps.length,
        ok: ok.length,
        ng: ng.length,
        failed: ng.map((r) => ({ appName: r.appName, issues: r.issues, status: r.status })),
      },
      null,
      2,
    ),
  );
  console.log(`📄 結果を保存: ${outPath}\n`);

  process.exit(ng.length > 0 ? 1 : 0);
}

// 直接実行されたときだけ走らせる。require されたときは検査関数だけを公開する
// （検知器そのものが壊れた入力で正しく落ちるかを検証できるようにするため）
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { extractAssetRefs, resolveAssetUrl, checkAssets, diagnose };
