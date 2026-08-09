import { globSync, readFileSync, writeFileSync } from "node:fs";

const OLD_RING = "focus-visible:ring-2";
const STANDARD_RING = "focus-visible:ring-[3px]";
const FOCUS_OFFSET = "focus-visible:ring-offset-2";
const OFFSET_BACKGROUND = "ring-offset-background";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeClassToken(value, token) {
  const escaped = escapeRegExp(token);
  return value.replace(new RegExp(`(?:^${escaped}(?:\\s+|$)|\\s+${escaped}(?=\\s|$))`, "g"), "");
}

function transformClassLiteral(value) {
  const oldRingPattern = new RegExp(`(^|\\s)${escapeRegExp(OLD_RING)}(?=\\s|$)`, "g");
  const matches = value.match(oldRingPattern);
  const replacements = matches?.length ?? 0;

  if (replacements === 0) {
    return { source: value, replacements: 0 };
  }

  let source = value.replace(oldRingPattern, `$1${STANDARD_RING}`);
  source = removeClassToken(source, FOCUS_OFFSET);
  source = removeClassToken(source, OFFSET_BACKGROUND);

  return { source, replacements };
}

function transformSource(source) {
  let output = "";
  let cursor = 0;
  let replacements = 0;

  while (cursor < source.length) {
    const quote = source[cursor];
    const previous = source[cursor - 1] ?? "";
    const isApostropheInWord = quote === "'" && /[\p{L}\p{N}_]/u.test(previous);
    if ((quote !== '"' && quote !== "'" && quote !== "`") || isApostropheInWord) {
      output += quote;
      cursor += 1;
      continue;
    }

    let end = cursor + 1;
    while (end < source.length) {
      if (source[end] === "\\") {
        end += 2;
        continue;
      }
      if (source[end] === quote) break;
      end += 1;
    }

    if (end >= source.length) {
      output += source.slice(cursor);
      break;
    }

    const value = source.slice(cursor + 1, end);
    const result = transformClassLiteral(value);
    output += quote + result.source + quote;
    replacements += result.replacements;
    cursor = end + 1;
  }

  return { changed: replacements > 0, source: output, replacements };
}

export function focusRingToStandards(source) {
  const result = transformSource(source);
  return { changed: result.changed, source: result.source };
}

function main() {
  const appName = process.argv[2];
  if (appName && !/^[a-z0-9-]+$/.test(appName)) {
    console.error(`不正なアプリ名です: ${appName}`);
    process.exit(1);
  }

  const pattern = appName ? `apps/${appName}/src/**/*.tsx` : "apps/*/src/**/*.tsx";
  const files = globSync(pattern)
    .filter((file) => !file.includes("/__tests__/") && !file.includes(".stories."))
    .sort();

  if (files.length === 0) {
    console.error(`対象ファイルがありません: ${pattern}`);
    process.exit(1);
  }

  let changedFiles = 0;
  let totalReplacements = 0;
  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const result = transformSource(original);
    console.log(`${file}: ${result.replacements} 件`);
    if (result.changed) {
      writeFileSync(file, result.source);
      changedFiles += 1;
      totalReplacements += result.replacements;
    }
  }

  console.log(`処理: ${files.length} ファイル`);
  console.log(`変更: ${changedFiles} ファイル / 置換: ${totalReplacements} 件`);
}

if (process.argv[1]?.endsWith("fix-focus-ring.js")) {
  main();
}
