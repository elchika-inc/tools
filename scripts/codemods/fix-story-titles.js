import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { globSync } from "node:fs";

// stories の title をアプリ名で名前空間化する。
// Storybook の story ID は title から導出されるため、346 アプリで同じ 'UI/Button' が
// 衝突して起動できなくなっていた。
const TITLE_RE = /title:\s*(['"])((?:(?!\1).)*)\1/;

export function namespaceTitle(source, appName) {
  const m = source.match(TITLE_RE);
  if (!m) return { changed: false, source };
  const current = m[2];
  if (current.startsWith(`${appName}/`)) return { changed: false, source };
  const quote = m[1];
  const replaced = source.replace(
    TITLE_RE,
    `title: ${quote}${appName}/${current}${quote}`,
  );
  return { changed: true, source: replaced };
}

function main() {
  const files = globSync("apps/*/src/**/*.stories.tsx");
  let changed = 0;
  for (const file of files) {
    const appName = file.split(path.sep)[1];
    const original = readFileSync(file, "utf8");
    const result = namespaceTitle(original, appName);
    if (result.changed) {
      writeFileSync(file, result.source);
      changed++;
    }
  }
  console.log(`${changed} / ${files.length} ファイルの title を名前空間化しました`);
  if (files.length === 0) {
    console.error("stories ファイルが 1 つも見つかりません");
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith("fix-story-titles.js")) {
  main();
}
