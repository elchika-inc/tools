#!/usr/bin/env node
/**
 * AI Design Quality Audit
 * DS-001〜DS-010 に基づき全アプリを静的解析する
 *
 * 使用方法:
 *   node scripts/design-audit.js
 *   node scripts/design-audit.js --app=url-encoder
 *   node scripts/design-audit.js --rule=DS-003
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const filterApp = args.find(a => a.startsWith('--app='))?.split('=')[1];
const filterRule = args.find(a => a.startsWith('--rule='))?.split('=')[1];

const ARBITRARY_COLOR_PATTERNS = [
  /\btext-(blue|red|green|yellow|purple|pink|orange|cyan|teal|indigo|violet|rose|fuchsia|sky|lime|amber|emerald|slate|gray|zinc|neutral|stone)-\d{2,3}\b/,
  /\bbg-(blue|red|green|yellow|purple|pink|orange|cyan|teal|indigo|violet|rose|fuchsia|sky|lime|amber|emerald|slate|gray|zinc|neutral|stone)-\d{2,3}\b/,
  /\bborder-(blue|red|green|yellow|purple|pink|orange|cyan|teal|indigo|violet|rose|fuchsia|sky|lime|amber|emerald|slate|gray|zinc|neutral|stone)-\d{2,3}\b/,
];

/** apps/<name>/src/ 配下の tsx/ts ファイル一覧（components/ui/ 除外） */
function getTsxFiles(appDir) {
  const srcDir = path.join(appDir, 'src');
  if (!fs.existsSync(srcDir)) return [];
  const results = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'ui') continue;
        walk(full);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        results.push(full);
      }
    }
  }
  walk(srcDir);
  return results;
}

const RULES = {
  'DS-001': ({ appDir, tsxContents }) => {
    const appTsx = tsxContents.find(([f]) => f.endsWith('App.tsx'));
    if (!appTsx) return [];
    const [file, content] = appTsx;
    if (!content.includes('min-h-screen') || !content.includes('bg-background')) {
      return [{ rule: 'DS-001', file: path.relative(appDir, file), detail: 'min-h-screen bg-background ラッパーがない' }];
    }
    return [];
  },

  'DS-002': ({ appDir, tsxContents }) => {
    const appTsx = tsxContents.find(([f]) => f.endsWith('App.tsx'));
    if (!appTsx) return [];
    const [file] = appTsx;
    const violations = [];
    if (!tsxContents.some(([, content]) => content.includes('トップに戻る'))) {
      violations.push({ rule: 'DS-002', file: path.relative(appDir, file), detail: '"← Tools トップに戻る" バックリンクがない' });
    }
    if (!tsxContents.some(([, content]) => content.includes('text-3xl font-bold tracking-tight'))) {
      violations.push({ rule: 'DS-002', file: path.relative(appDir, file), detail: 'h1 に text-3xl font-bold tracking-tight がない' });
    }
    return violations;
  },

  'DS-003': ({ appDir, tsxContents }) => {
    const violations = [];
    for (const [file, content] of tsxContents) {
      // Collapse multi-line <button ...> tags into single lines for accurate matching
      const collapsed = content.replace(/<button\b[^>]*>/gs, m => m.replace(/\n\s*/g, ' '));
      const lines = collapsed.split('\n');
      lines.forEach((line, i) => {
        if (/<button\b(?![^>]*\btype=)[^>]*>/.test(line)) {
          violations.push({ rule: 'DS-003', file: path.relative(appDir, file), detail: `L${i + 1}: <button> に type 属性がない` });
        }
      });
    }
    return violations;
  },

  'DS-004': ({ appDir, tsxContents }) => {
    const violations = [];
    for (const [file, content] of tsxContents) {
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
        // Skip JSX comment lines
        if (/^\s*\{\/\*/.test(line)) return;
        for (const pattern of ARBITRARY_COLOR_PATTERNS) {
          const match = line.match(pattern);
          if (match) {
            violations.push({ rule: 'DS-004', file: path.relative(appDir, file), detail: `L${i + 1}: 任意カラークラス "${match[0]}"` });
            break;
          }
        }
      });
    }
    return violations;
  },

  'DS-005': ({ appDir, tsxContents }) => {
    const violations = [];
    for (const [file, content] of tsxContents) {
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (/from\s+['"]\.\.+\/.*components\/ui\//.test(line)) {
          violations.push({ rule: 'DS-005', file: path.relative(appDir, file), detail: `L${i + 1}: 相対パスで components/ui をインポートしている` });
        }
      });
    }
    return violations;
  },

  'DS-006': ({ appDir, indexHtml }) => {
    if (!indexHtml) return [{ rule: 'DS-006', file: 'index.html', detail: 'index.html が存在しない' }];
    if (!/<html[^>]+lang="ja"/.test(indexHtml)) {
      return [{ rule: 'DS-006', file: 'index.html', detail: 'lang="ja" が設定されていない' }];
    }
    return [];
  },

  'DS-007': ({ appDir, indexHtml }) => {
    if (!indexHtml) return [];
    if (!/<meta\s[^>]*name="description"[^>]*content="[^"]+"\s*\/?>/i.test(indexHtml)) {
      return [{ rule: 'DS-007', file: 'index.html', detail: 'meta description が未設定または空' }];
    }
    return [];
  },

  'DS-008': ({ appDir, indexHtml }) => {
    if (!indexHtml) return [];
    const violations = [];
    if (!/<meta\s[^>]*property="og:title"/.test(indexHtml)) {
      violations.push({ rule: 'DS-008', file: 'index.html', detail: 'og:title がない' });
    }
    if (!/<meta\s[^>]*property="og:description"/.test(indexHtml)) {
      violations.push({ rule: 'DS-008', file: 'index.html', detail: 'og:description がない' });
    }
    return violations;
  },

  'DS-009': ({ appDir, tsxContents }) => {
    const appTsx = tsxContents.find(([f]) => f.endsWith('App.tsx'));
    if (!appTsx) return [];
    const [file, content] = appTsx;
    if (!content.includes('max-w-7xl') && !content.includes('max-w-6xl') && !content.includes('max-w-5xl')) {
      return [{ rule: 'DS-009', file: path.relative(appDir, file), detail: 'max-w コンテナがない (max-w-5xl/6xl/7xl のいずれか)' }];
    }
    return [];
  },

  'DS-010': ({ appDir, tsxContents }) => {
    const warnings = [];
    for (const [file, content] of tsxContents) {
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (/\b(?:gap|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|space-[xy])-\[/.test(line)) {
          if (!line.includes('optical adjustment')) {
            warnings.push({ rule: 'DS-010', file: path.relative(appDir, file), detail: `L${i + 1}: 任意スペーシング値 (SHOULD: /* optical adjustment */ コメントを付けること)` });
          }
        }
      });
    }
    return warnings;
  },
};

/** DS-010 は SHOULD なので警告扱い。exit code に影響しない */
const SHOULD_RULES = new Set(['DS-010']);

function auditApp(appName) {
  const appDir = path.join(__dirname, '..', 'apps', appName);
  if (!fs.existsSync(appDir)) return null;

  const indexHtmlPath = path.join(appDir, 'index.html');
  const indexHtml = fs.existsSync(indexHtmlPath) ? fs.readFileSync(indexHtmlPath, 'utf-8') : null;

  const tsxFiles = getTsxFiles(appDir);
  const tsxContents = [];
  for (const f of tsxFiles) {
    try {
      tsxContents.push([f, fs.readFileSync(f, 'utf-8')]);
    } catch {
      console.warn(`  ⚠️  読み込みスキップ: ${path.relative(appDir, f)}`);
    }
  }
  const ctx = { appDir, appName, indexHtml, tsxFiles, tsxContents };

  const violations = [];
  const warnings = [];
  for (const [ruleId, check] of Object.entries(RULES)) {
    if (filterRule && filterRule !== ruleId) continue;
    const findings = check(ctx);
    if (SHOULD_RULES.has(ruleId)) {
      warnings.push(...findings);
    } else {
      violations.push(...findings);
    }
  }
  return { appName, violations, warnings };
}

async function main() {
  const appsDir = path.join(__dirname, '..', 'apps');
  const allApps = fs.readdirSync(appsDir)
    .filter(d => fs.statSync(path.join(appsDir, d)).isDirectory())
    .sort();

  const targets = filterApp ? allApps.filter(a => a === filterApp) : allApps;
  if (filterApp && targets.length === 0) {
    console.error(`❌ アプリ "${filterApp}" が見つかりません`);
    process.exit(1);
  }

  console.log(`\n🔍 デザイン監査開始: ${targets.length} アプリ${filterRule ? ` (${filterRule} のみ)` : ''}\n`);

  const results = targets.map(name => auditApp(name)).filter(Boolean);
  const violating = results.filter(r => r.violations.length > 0);
  const withWarnings = results.filter(r => r.warnings.length > 0);
  const clean = results.filter(r => r.violations.length === 0);
  const totalViolations = results.reduce((s, r) => s + r.violations.length, 0);
  const totalWarnings = results.reduce((s, r) => s + r.warnings.length, 0);

  for (const { appName, violations, warnings } of results) {
    if (violations.length > 0) {
      console.log(`\n❌ ${appName} (${violations.length}件)`);
      for (const v of violations) {
        console.log(`   ${v.rule}  ${v.file}  ${v.detail}`);
      }
    }
    if (warnings.length > 0) {
      console.log(`\n⚠️  ${appName} (${warnings.length}件 SHOULD)`);
      for (const w of warnings) {
        console.log(`   ${w.rule}  ${w.file}  ${w.detail}`);
      }
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 デザイン監査結果`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`✅ 準拠: ${clean.length} / ${targets.length}`);
  console.log(`❌ 違反あり (MUST): ${violating.length} / ${targets.length} (${totalViolations}件)`);
  console.log(`⚠️  警告あり (SHOULD): ${withWarnings.length} / ${targets.length} (${totalWarnings}件)`);
  console.log(`${'═'.repeat(60)}\n`);

  const outPath = path.join(__dirname, '..', '.docs', 'design-audit-result.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    filter: { app: filterApp ?? null, rule: filterRule ?? null },
    summary: {
      total: targets.length,
      clean: clean.length,
      violating: violating.length,
      totalViolations,
      withWarnings: withWarnings.length,
      totalWarnings,
    },
    apps: results.filter(r => r.violations.length > 0 || r.warnings.length > 0),
  }, null, 2));
  console.log(`📄 結果を保存: ${outPath}\n`);

  // SHOULD 違反のみでは exit 1 しない
  process.exit(violating.length > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
