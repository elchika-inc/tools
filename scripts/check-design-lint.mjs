#!/usr/bin/env node

// 構文だけで判定できるデザイン規約を検査する。
//
// 使い方: node scripts/check-design-lint.mjs

import { spawnSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const EXCLUDED_DIRECTORIES = new Set([".git", "dist", "node_modules"]);
const CSS_EXTENSIONS = new Set([".css"]);

const RULES = {
  opacityBackground: {
    name: "no-unbranched-opacity-bg",
    severity: "error",
    pattern: /(?<!dark:)bg-[a-z]+-[0-9]{2,3}\/[0-9]{1,3}/g,
    message:
      "透明度付きカラー背景は light テーマで淡色に合成されコントラストが崩壊する。bg-X-50 dark:bg-X-900/N のように theme-aware に分岐する（standards DESIGN.md §4 / URISK-009）",
  },
  faintText: {
    name: "no-unbranched-faint-text",
    severity: "warn",
    pattern: /(?<!dark:)text-(red|blue|green|yellow|amber|orange|purple|emerald)-(200|300|400)/g,
    message:
      "薄い有彩色テキストは light テーマの白背景で 4.5:1 を割る可能性がある。実背景を確認し、必要なら text-X-600 dark:text-X-400 へ分岐する（standards DESIGN.md §4 / URISK-009）",
  },
  themeNamespace: {
    name: "no-invalid-theme-namespace",
    severity: "error",
    pattern: /--(font-size|line-height)-[a-z0-9-]+\s*:/g,
    message:
      "Tailwind v4 は @theme の --font-size-* / --line-height-* を認識せず沈黙して無視する。font-size は --text-*、line-height は --leading-* を使う（URISK-023）",
  },
};

const diagnostics = [];
const scanFailures = [];
let scannedFiles = 0;

const listFiles = () => {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`git ls-files が exit ${result.status}: ${result.stderr.trim()}`);
  }
  return result.stdout
    .split("\0")
    .filter(Boolean)
    .filter((path) => {
      const segments = path.split("/");
      return !segments.some(
        (segment) => segment.startsWith(".") || EXCLUDED_DIRECTORIES.has(segment),
      );
    })
    .map((path) => join(ROOT, path));
};

const positionAt = (source, index) => {
  let line = 1;
  let lineStart = 0;
  for (let cursor = 0; cursor < index; cursor++) {
    if (source.charCodeAt(cursor) === 10) {
      line++;
      lineStart = cursor + 1;
    }
  }
  return { line, column: index - lineStart + 1 };
};

const addMatches = (path, source, rule, offset = 0) => {
  rule.pattern.lastIndex = 0;
  for (const match of source.matchAll(rule.pattern)) {
    const index = offset + match.index;
    diagnostics.push({ path, index, ...positionAt(sourceForPositions.get(path), index), rule });
  }
};

const maskCssTrivia = (source) =>
  source.replace(/\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'/g, (trivia) =>
    trivia.replace(/[^\n]/g, " "),
  );

const findBlockEnd = (source, openBrace) => {
  let depth = 1;
  for (let index = openBrace + 1; index < source.length; index++) {
    const character = source[index];
    if (character === "{") depth++;
    if (character === "}") {
      depth--;
      if (depth === 0) return index;
    }
  }
  return -1;
};

const scanThemeBlocks = (path, source) => {
  const masked = maskCssTrivia(source);
  const themeStart = /@theme(?:\s+[^\s{]+)?\s*\{/g;
  for (const match of masked.matchAll(themeStart)) {
    const openBrace = match.index + match[0].lastIndexOf("{");
    const closeBrace = findBlockEnd(masked, openBrace);
    if (closeBrace === -1) {
      scanFailures.push({
        path,
        message: `@theme ブロックを閉じる } を見つけられなかった（${positionAt(source, match.index).line}行目）`,
      });
      continue;
    }
    const bodyStart = openBrace + 1;
    addMatches(path, masked.slice(bodyStart, closeBrace), RULES.themeNamespace, bodyStart);
  }
};

const sourceForPositions = new Map();

let files;
try {
  files = listFiles();
} catch (error) {
  console.error(`✗ 検査対象を列挙できなかった: ${error.message}`);
  process.exit(1);
}

for (const path of files) {
  try {
    if (lstatSync(path).isSymbolicLink()) continue;
    const buffer = readFileSync(path);
    if (buffer.includes(0)) continue;
    const source = buffer.toString("utf8");
    sourceForPositions.set(path, source);
    scannedFiles++;
    addMatches(path, source, RULES.opacityBackground);
    addMatches(path, source, RULES.faintText);
    if (CSS_EXTENSIONS.has(extname(path))) scanThemeBlocks(path, source);
  } catch (error) {
    scanFailures.push({ path, message: error.message });
  }
}

if (scannedFiles === 0) {
  scanFailures.push({ path: ROOT, message: "検査対象ファイルが0件のため検査を完了できない" });
}

for (const diagnostic of diagnostics) {
  const path = relative(ROOT, diagnostic.path) || diagnostic.path;
  console.log(
    `${path}:${diagnostic.line}:${diagnostic.column} [${diagnostic.rule.severity}] ${diagnostic.rule.name}`,
  );
  console.log(`  ${diagnostic.rule.message}`);
}

for (const failure of scanFailures) {
  const path = relative(ROOT, failure.path) || ".";
  console.error(`${path} [error] design-lint-scan`);
  console.error(`  ${failure.message}`);
}

const count = (rule) => diagnostics.filter((diagnostic) => diagnostic.rule === rule).length;
const errorCount = diagnostics.filter((diagnostic) => diagnostic.rule.severity === "error").length;
console.log(
  `検査対象: ${scannedFiles} ファイル / R1 ${count(RULES.opacityBackground)} 件 / R2 ${count(RULES.faintText)} 件 / R3 ${count(RULES.themeNamespace)} 件`,
);

if (errorCount > 0 || scanFailures.length > 0) {
  console.error(
    `\n✗ error ${errorCount + scanFailures.length} 件 / warn ${diagnostics.length - errorCount} 件`,
  );
  process.exit(1);
}

console.log(`\n✓ error 0 件 / warn ${diagnostics.length} 件`);
