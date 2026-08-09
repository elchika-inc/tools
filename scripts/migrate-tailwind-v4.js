#!/usr/bin/env node
/**
 * Tailwind v3 → v4 + @tools/design-tokens-elchika への一括変換（SP2）
 *
 * 手順の正本: .docs/plans/tailwind-v4-migration-guide.md
 *
 * 設計方針:
 * - 冪等: 移行済みアプリは skip する（index.css の @tools/design-tokens-elchika で判定）
 * - fail-closed: 既定形と一致しないファイルは変換せず、理由を出して exit 1 にする。
 *   「たぶん大丈夫」で書き換えると、カスタム CSS を黙って捨てる事故になる
 * - 側面隔離: 1 アプリの失敗で全体を止めない。失敗を集約して最後に報告する
 *
 * 使用方法:
 *   node scripts/migrate-tailwind-v4.js --dry-run
 *   node scripts/migrate-tailwind-v4.js --app=json-formatter
 *   node scripts/migrate-tailwind-v4.js
 */

const fs = require("node:fs");
const { createHash } = require("node:crypto");
const path = require("node:path");

const REPO_ROOT = path.join(__dirname, "..");
const APPS_DIR = path.join(REPO_ROOT, "apps");

/** 移行後の index.css の全内容 */
const MIGRATED_INDEX_CSS = `@import "@tools/design-tokens-elchika";\n`;

/**
 * v3 既定形 index.css の SHA-256。
 * 移行前の apps 配下にある src/index.css のうち 339 件がこの値だった（SP2 着手時の実測）。
 *
 * 実行時に特定アプリのファイルを読んで基準にしてはならない。
 * 基準アプリ自身を変換した瞬間に基準が変わり、以降すべてのアプリが
 * 「一致しない」と判定される（自己破壊）。
 */
const BASELINE_INDEX_CSS_SHA256 =
  "2dc6990ea59b03c14aeada34837ec04166918c9842c984293d242d9615f266a2";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const appArg = args.find((a) => a.startsWith("--app="));

if (appArg !== undefined && appArg.slice("--app=".length) === "") {
  console.error("引数エラー: --app の値が空である");
  process.exit(1);
}
const filterApp = appArg ? appArg.slice("--app=".length) : null;
if (filterApp !== null && (filterApp.includes("/") || filterApp.includes(path.sep))) {
  console.error("引数エラー: --app に path separator は指定できない");
  process.exit(1);
}
for (const a of args) {
  if (a !== "--dry-run" && !a.startsWith("--app=")) {
    console.error(`引数エラー: 未知のオプション ${a}`);
    process.exit(1);
  }
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

/** 移行済みか（冪等性の判定） */
function isMigrated(appDir) {
  const css = read(path.join(appDir, "src", "index.css"));
  if (css === null) return false;
  return /^\s*@import\s+["']@tools\/design-tokens-elchika["']\s*;/m.test(css);
}

/** package.json を v4 構成へ書き換えた文字列を返す */
function migratePackageJson(source) {
  const pkg = JSON.parse(source);
  pkg.dependencies = pkg.dependencies || {};
  delete pkg.dependencies["@tools/design-tokens"];
  pkg.dependencies["@tools/design-tokens-elchika"] = "workspace:*";
  pkg.dependencies = Object.fromEntries(
    Object.entries(pkg.dependencies).sort(([left], [right]) => left.localeCompare(right)),
  );

  const dev = pkg.devDependencies || {};
  delete dev.autoprefixer;
  delete dev.postcss;
  delete dev["tailwindcss-animate"];
  dev.tailwindcss = "^4.3.3";
  dev["@tailwindcss/vite"] = "^4.3.3";
  pkg.devDependencies = Object.fromEntries(
    Object.entries(dev).sort(([left], [right]) => left.localeCompare(right)),
  );

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

/** vite.config.ts に tailwindcss プラグインを追加した文字列を返す。base には触らない */
function migrateViteConfig(source) {
  if (source.includes("@tailwindcss/vite")) return source;

  const withImport = source.replace(
    /^(import react from '@vitejs\/plugin-react-swc';)$/m,
    "import tailwindcss from '@tailwindcss/vite';\n$1",
  );
  if (withImport === source) return null;

  const withPlugin = withImport.replace(
    /^(\s*)plugins: \[react\(\)(, wasm\(\))?\],$/m,
    "$1plugins: [react()$2, tailwindcss()],",
  );
  if (withPlugin === withImport) return null;

  return withPlugin;
}

const targets = (filterApp ? [filterApp] : fs.readdirSync(APPS_DIR).sort()).filter((name) => {
  const dir = path.join(APPS_DIR, name);
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
});

if (targets.length === 0) {
  console.error(filterApp ? `${filterApp} は存在しない` : "apps 配下にアプリがない");
  process.exit(1);
}

const migrated = [];
const skipped = [];
const blocked = [];

for (const name of targets) {
  const appDir = path.join(APPS_DIR, name);

  if (isMigrated(appDir)) {
    skipped.push(`${name}: 移行済み`);
    continue;
  }

  const indexCssPath = path.join(appDir, "src", "index.css");
  const indexCss = read(indexCssPath);
  if (indexCss === null) {
    blocked.push(`${name}: src/index.css が存在しない`);
    continue;
  }
  if (sha256(indexCss) !== BASELINE_INDEX_CSS_SHA256) {
    blocked.push(`${name}: index.css が既定形と一致しない（個別対応が必要）`);
    continue;
  }

  const pkgPath = path.join(appDir, "package.json");
  const pkgSource = read(pkgPath);
  if (pkgSource === null) {
    blocked.push(`${name}: package.json が存在しない`);
    continue;
  }

  const viteConfigPath = path.join(appDir, "vite.config.ts");
  const viteSource = read(viteConfigPath);
  if (viteSource === null) {
    blocked.push(`${name}: vite.config.ts が存在しない`);
    continue;
  }
  const nextVite = migrateViteConfig(viteSource);
  if (nextVite === null) {
    blocked.push(`${name}: vite.config.ts の plugins/import が想定形でないため書き換えられない`);
    continue;
  }

  if (!dryRun) {
    fs.writeFileSync(pkgPath, migratePackageJson(pkgSource));
    fs.writeFileSync(viteConfigPath, nextVite);
    fs.writeFileSync(indexCssPath, MIGRATED_INDEX_CSS);
    for (const f of ["tailwind.config.js", "postcss.config.js"]) {
      const p = path.join(appDir, f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  }
  migrated.push(name);
}

for (const name of migrated) console.log(`${dryRun ? "would migrate" : "migrated"}: ${name}`);
for (const s of skipped) console.log(`skip: ${s}`);
for (const b of blocked) console.error(`blocked: ${b}`);

console.log(
  `\n${dryRun ? "[dry-run] " : ""}変換 ${migrated.length} / skip ${skipped.length} / blocked ${blocked.length}`,
);

process.exit(blocked.length > 0 ? 1 : 0);
