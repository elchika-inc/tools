#!/usr/bin/env node
/**
 * アセットパス整合性チェック（ネットワーク不要の静的ゲート）
 *
 * このリポは 1 つの Workers で /<app>/ サブパス配信するため、
 * 各アプリの vite base は必ず './' でなければならない。
 * './' 以外だとビルド後の HTML が /assets/... を参照し、実体( /<app>/assets/... )に
 * 届かず全アプリが白画面になる。過去に複数回再発している。
 * 詳細: .docs/ASSET_PATH_INCIDENT.md
 *
 * 検査内容:
 *   1. apps/<app>/vite.config.ts の base が './' か
 *   2. packages/router/public/<app>/index.html が絶対パス /assets/ を参照していないか
 *   3. その参照先ファイルが実在するか
 *
 * 使用方法:
 *   node scripts/check-asset-paths.js                # 1〜3 すべて検査
 *   node scripts/check-asset-paths.js --config-only  # 1 のみ(ビルド前用。成果物は未生成なので)
 *
 * 違反があれば exit 1。判定できなかった場合も exit 1（ゲートなので fail-closed）。
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const APPS_DIR = path.join(REPO_ROOT, 'apps');
const PUBLIC_DIR = path.join(REPO_ROOT, 'packages', 'router', 'public');
/** base に期待する「値」。ソース上のクォート種別は問わない（下記 stripQuotes を参照） */
const EXPECTED_BASE = './';
/** メッセージ表示用のリテラル表記 */
const EXPECTED_BASE_LITERAL = `'${EXPECTED_BASE}'`;

/**
 * 文字列リテラルからクォートを外して値を取り出す。
 * Oxfmt はクォートを正規化するため（`base: './'` → `base: "./"`）、
 * ソーステキストの完全一致で判定すると runtime 同値でも違反と誤判定する。
 * クォートで囲まれていない場合（変数・式など）は値を確定できないため null を返し、
 * 呼び出し側で violation として扱う（ゲートなので fail-closed）。
 */
function stripQuotes(literal) {
  const matched = literal.match(/^(['"`])(.*)\1$/);
  return matched ? matched[2] : null;
}

const configOnly = process.argv.includes('--config-only');

/** ディレクトリ直下のサブディレクトリ名一覧 */
function listDirs(dir) {
  return fs.readdirSync(dir)
    .filter(name => fs.statSync(path.join(dir, name)).isDirectory())
    .sort();
}

/** 1. vite.config.ts の base 検査 */
function checkViteConfigs() {
  const violations = [];

  if (!fs.existsSync(APPS_DIR)) {
    violations.push({ file: 'apps/', issue: 'apps ディレクトリが見つからない' });
    return violations;
  }

  for (const app of listDirs(APPS_DIR)) {
    const configPath = path.join(APPS_DIR, app, 'vite.config.ts');
    const rel = `apps/${app}/vite.config.ts`;

    if (!fs.existsSync(configPath)) {
      // vite.config.ts を持たないアプリは base を宣言できていない = 判定不能
      violations.push({ file: rel, issue: 'vite.config.ts が存在せず base を確認できない' });
      continue;
    }

    const src = fs.readFileSync(configPath, 'utf8');
    const m = src.match(/^\s*base\s*:\s*(.+?)\s*,?\s*$/m);

    if (!m) {
      violations.push({ file: rel, issue: `base が未指定 (${EXPECTED_BASE_LITERAL} を明示すること)` });
      continue;
    }

    const raw = m[1].replace(/,$/, '').trim();
    const actual = stripQuotes(raw);
    if (actual === null) {
      violations.push({
        file: rel,
        issue: `base: ${raw} は文字列リテラルでないため値を確定できない (${EXPECTED_BASE_LITERAL} を直接書くこと)`,
      });
    } else if (actual !== EXPECTED_BASE) {
      violations.push({ file: rel, issue: `base: ${raw} → ${EXPECTED_BASE_LITERAL} でなければならない` });
    }
  }

  return violations;
}

/** 2, 3. ビルド成果物の参照パスと実体の検査 */
function checkBuildOutput() {
  const violations = [];

  if (!fs.existsSync(PUBLIC_DIR)) {
    violations.push({ file: 'packages/router/public/', issue: 'ビルド成果物が存在しない（build-all.sh 未実行？）' });
    return violations;
  }

  for (const app of listDirs(PUBLIC_DIR).filter(name => name !== 'fonts')) {
    const htmlPath = path.join(PUBLIC_DIR, app, 'index.html');
    const rel = `packages/router/public/${app}/index.html`;

    if (!fs.existsSync(htmlPath)) {
      violations.push({ file: rel, issue: 'index.html が存在しない' });
      continue;
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const refs = [...html.matchAll(/(?:src|href)="([^"]*\.(?:js|css))"/g)].map(m => m[1]);

    if (refs.length === 0) {
      violations.push({ file: rel, issue: 'JS/CSS の参照が 1 つも無い（ビルド不全の可能性）' });
      continue;
    }

    for (const ref of refs) {
      if (/^https?:\/\//.test(ref)) continue; // 外部 CDN は対象外

      if (ref.startsWith('/')) {
        if (ref.startsWith('/fonts/')) {
          const sharedAssetPath = path.join(PUBLIC_DIR, ref.slice(1));
          if (!fs.existsSync(sharedAssetPath)) {
            violations.push({ file: rel, issue: `共有フォントの参照先が存在しない "${ref}"` });
          }
          continue;
        }
        violations.push({ file: rel, issue: `絶対パス参照 "${ref}" （./ 相対でなければ 404 になる）` });
        continue;
      }

      const assetPath = path.join(PUBLIC_DIR, app, ref.replace(/^\.\//, ''));
      if (!fs.existsSync(assetPath)) {
        violations.push({ file: rel, issue: `参照先が存在しない "${ref}"` });
      }
    }
  }

  return violations;
}

function main() {
  console.log('🔍 アセットパス整合性チェック');
  console.log(`   モード: ${configOnly ? 'vite.config のみ' : 'vite.config + ビルド成果物'}\n`);

  let violations = [];

  const configViolations = checkViteConfigs();
  const appCount = fs.existsSync(APPS_DIR) ? listDirs(APPS_DIR).length : 0;
  console.log(
    `  vite.config.ts : ${appCount - configViolations.length} / ${appCount} が base: ${EXPECTED_BASE_LITERAL}`
  );
  violations = violations.concat(configViolations);

  if (!configOnly) {
    const buildViolations = checkBuildOutput();
    const outCount = fs.existsSync(PUBLIC_DIR)
      ? listDirs(PUBLIC_DIR).filter(name => name !== 'fonts').length
      : 0;
    console.log(`  ビルド成果物   : ${outCount} アプリを検査、違反 ${buildViolations.length} 件`);
    violations = violations.concat(buildViolations);
  }

  if (violations.length === 0) {
    console.log('\n✅ 問題なし\n');
    process.exit(0);
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`❌ ${violations.length} 件の違反`);
  console.log(`${'─'.repeat(60)}`);
  // 件数が多くなりうるので先頭 40 件のみ表示（打ち切りは必ず明示する）
  const SHOW = 40;
  for (const v of violations.slice(0, SHOW)) {
    console.log(`  ${v.file}`);
    console.log(`    ⚠️  ${v.issue}`);
  }
  if (violations.length > SHOW) {
    console.log(`\n  … 他 ${violations.length - SHOW} 件（表示を ${SHOW} 件で打ち切り）`);
  }
  console.log('\n対処: apps/*/vite.config.ts の base を \'./\' に直して再ビルドする。');
  console.log('      ビルド成果物 (packages/router/public/) を直接書き換えても次のビルドで巻き戻る。');
  console.log('      詳細: .docs/ASSET_PATH_INCIDENT.md\n');

  process.exit(1);
}

try {
  main();
} catch (err) {
  // ゲートなので、判定できなかったら通さない
  console.error('❌ チェック実行中にエラー:', err.message);
  process.exit(1);
}
