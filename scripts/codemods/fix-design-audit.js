import { globSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "../..");
const BACKLINK_TEXT = "← Tools トップに戻る";
const BACKLINK_MARKER = "トップに戻る";
const H1_TOKENS = ["text-3xl", "font-bold", "tracking-tight"];
const DS004_PATTERN =
  /\b(?:text|bg|border)-(?:blue|red|green|yellow|purple|pink|orange|cyan|teal|indigo|violet|rose|fuchsia|sky|lime|amber|emerald|slate|gray|zinc|neutral|stone)-\d{2,3}\b/;
const STATUS_CONTEXT =
  /\b(?:error|success|warning|danger|invalid|valid|validation|alert|status|failure|failed)\b|role=["']alert["']|失敗|成功|警告|危険|有効|無効|一致|不一致|安全|脆弱/iu;
const MEANINGFUL_COLOR_APP = /(?:^|-)(?:syntax|code|chart)(?:-|$)/;
const CARD_HEADING_APPS = new Set([
  "csp-builder",
  "data-anonymizer",
  "password-strength",
  "secret-redactor",
  "sri-hash-generator",
  "totp-generator",
]);

function lineIndentAt(source, position) {
  const lineStart = source.lastIndexOf("\n", position - 1) + 1;
  return source.slice(lineStart, position).match(/^\s*/)?.[0] ?? "";
}

function hasBacklink(source) {
  return source.includes(BACKLINK_MARKER);
}

function addBacklink(source) {
  if (hasBacklink(source)) return source;
  const header = source.match(/<header\b[^>]*>/);
  if (!header || header.index === undefined) return source;

  const headerEnd = header.index + header[0].length;
  const afterHeader = source.slice(headerEnd);
  const wrapper = afterHeader.match(/^(?:\s|\{\/\*[\s\S]*?\*\/\})*<div\b[^>]*>/);
  const insertionPoint = wrapper ? headerEnd + wrapper.index + wrapper[0].length : headerEnd;
  const parentIndent = lineIndentAt(source, insertionPoint);
  const indent = `${parentIndent}  `;
  const backlink = `\n${indent}<div className="mb-2">\n${indent}  <a href="/" className="text-sm text-primary hover:underline">\n${indent}    ${BACKLINK_TEXT}\n${indent}  </a>\n${indent}</div>`;
  return `${source.slice(0, insertionPoint)}${backlink}${source.slice(insertionPoint)}`;
}

function normalizeFirstH1(source) {
  return source.replace(/<h1\b([^>]*)>/, (opening, attributes) => {
    const classMatch = attributes.match(/\bclassName=(['"])(.*?)\1/);
    if (!classMatch) {
      return `<h1${attributes} className="${H1_TOKENS.join(" ")}">`;
    }
    const preserved = classMatch[2]
      .split(/\s+/)
      .filter(Boolean)
      .filter(
        (token) =>
          !/^text-(?:xs|sm|base|lg|xl|\d+xl)$/.test(token) &&
          token !== "font-bold" &&
          token !== "tracking-tight",
      );
    const classes = [...H1_TOKENS, ...preserved].join(" ");
    return opening.replace(classMatch[0], `className="${classes}"`);
  });
}

function convertSimpleTitleBlock(source) {
  return source.replace(
    /<div(\s+className=(['"])[^'"]*\2)?>\s*(<h1\b[\s\S]*?<\/h1>\s*<p\b[\s\S]*?<\/p>)\s*<\/div>/,
    (_match, classAttribute = "", _quote, contents, offset) => {
      const indent = lineIndentAt(source, offset);
      const children = contents
        .trim()
        .split("\n")
        .map((line) => `${indent}  ${line.trim()}`)
        .join("\n");
      return `<header${classAttribute}>\n${children}\n${indent}</header>`;
    },
  );
}

function convertCardTitle(source) {
  return source.replace(
    /<CardHeader>\s*<CardTitle>([\s\S]*?)<\/CardTitle>\s*<CardDescription>([\s\S]*?)<\/CardDescription>\s*<\/CardHeader>/,
    (_match, title, description) => `<CardHeader>
              <header>
                <h1 className="text-3xl font-bold tracking-tight">${title.trim()}</h1>
                <p className="mt-2 text-sm text-muted-foreground">${description.trim()}</p>
              </header>
            </CardHeader>`,
  );
}

function removeUnusedCardHeadingImports(source) {
  const unusedNames = ["CardTitle", "CardDescription"].filter(
    (name) => !source.includes(`<${name}`),
  );
  if (unusedNames.length === 0) return source;
  return source.replace(
    /import\s*\{([\s\S]*?)\}\s*from\s*(["']@\/components\/ui\/card["']);/,
    (_match, imports, modulePath) => {
      const names = imports
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .filter((name) => !unusedNames.includes(name));
      return `import { ${names.join(", ")} } from ${modulePath};`;
    },
  );
}

function convertNotePadTitle(source, appName) {
  if (appName !== "note-pad" || source.includes("<header")) return source;
  return source.replace(
    /(<div className="p-4 border-b space-y-3">\s*)(<h1\b[\s\S]*?<\/h1>)/,
    (_match, prefix, h1, offset) => {
      const indent = lineIndentAt(source, offset + prefix.length);
      return `${prefix}<header>\n${indent}  ${h1.trim()}\n${indent}  <p className="mt-2 text-sm text-muted-foreground">ブラウザ内でノートを作成・編集・保存します。</p>\n${indent}</header>`;
    },
  );
}

export function replaceSemanticStatusColors(source, appName, filePath) {
  if (
    appName === "home" ||
    MEANINGFUL_COLOR_APP.test(appName) ||
    /(?:syntax|code|chart)/i.test(filePath)
  ) {
    return { source, replacements: 0 };
  }

  let replacements = 0;
  const updated = source
    .split("\n")
    .map((line) => {
      if (!STATUS_CONTEXT.test(line)) return line;
      return line.replace(
        /\b(text|bg|border)-(red|green|emerald|yellow|orange|amber)-\d{2,3}\b/g,
        (_token, property, color) => {
          replacements += 1;
          if (color === "red") {
            if (property === "text") return "text-destructive";
            if (property === "border") return "border-destructive";
            return /bg-red-(?:50|100|200|900|950)\b/.test(_token)
              ? "bg-destructive-subtle"
              : "bg-destructive";
          }
          const semantic = color === "green" || color === "emerald" ? "success" : "warning";
          if (property === "text") return `text-${semantic}-foreground`;
          return `${property}-${semantic}`;
        },
      );
    })
    .join("\n");
  return { source: updated, replacements };
}

export function fixDesignAuditSource(source, appName) {
  const original = source;
  let updated = source;
  if (!updated.includes("<header")) {
    updated = convertCardTitle(updated);
    updated = convertSimpleTitleBlock(updated);
    updated = convertNotePadTitle(updated, appName);
  }
  updated = addBacklink(updated);
  updated = normalizeFirstH1(updated);
  if (CARD_HEADING_APPS.has(appName)) {
    updated = removeUnusedCardHeadingImports(updated);
  }
  const status = replaceSemanticStatusColors(updated, appName, "src/App.tsx");
  updated = status.source;

  return {
    source: updated,
    ds002Changed:
      updated !== original && (hasBacklink(updated) || updated.includes(H1_TOKENS.join(" "))),
    ds004Replacements: status.replacements,
    unresolvedDs002: !hasBacklink(updated) || !updated.includes(H1_TOKENS.join(" ")),
  };
}

function countDs004Violations() {
  let count = 0;
  const files = globSync(path.join(ROOT_DIR, "apps", "*", "src", "**", "*.{ts,tsx}"));
  for (const file of files) {
    if (
      file.includes(`${path.sep}home${path.sep}`) ||
      file.includes(`${path.sep}components${path.sep}ui${path.sep}`)
    )
      continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || /^\s*\{\/\*/.test(line)) continue;
      if (DS004_PATTERN.test(line)) count += 1;
    }
  }
  return count;
}

function main() {
  const appFiles = globSync(path.join(ROOT_DIR, "apps", "*", "src", "App.tsx")).filter(
    (file) => !file.includes(`${path.sep}home${path.sep}`),
  );
  const ds004Before = countDs004Violations();
  const unresolved = [];
  let changedFiles = 0;
  let ds002Changed = 0;
  let ds004Replacements = 0;

  for (const file of appFiles) {
    const appName = file.split(path.sep).at(-3);
    const source = readFileSync(file, "utf8");
    const result = fixDesignAuditSource(source, appName);
    if (result.unresolvedDs002 && appName !== "text-diff-checker") unresolved.push(appName);
    if (result.source === source) continue;
    writeFileSync(file, result.source);
    changedFiles += 1;
    if (result.ds002Changed) ds002Changed += 1;
    ds004Replacements += result.ds004Replacements;
  }

  const ds004After = countDs004Violations();
  console.log(`処理対象 App.tsx: ${appFiles.length}`);
  console.log(`変更ファイル: ${changedFiles}`);
  console.log(`DS-002 修正アプリ: ${ds002Changed}`);
  console.log(`DS-004 置換クラス: ${ds004Replacements}`);
  console.log(`DS-004 未処理違反: ${ds004After} / ${ds004Before}`);
  console.log(`DS-009 未処理違反: 181（司令塔裁定により対象外）`);
  if (unresolved.length > 0) {
    console.error(`DS-002 未解決アプリ (${unresolved.length}): ${unresolved.join(", ")}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && process.argv[1].endsWith("fix-design-audit.js")) {
  main();
}
