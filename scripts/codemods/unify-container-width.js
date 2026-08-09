import { globSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "../..");
const COMPLIANT_WIDTHS = ["max-w-5xl", "max-w-6xl", "max-w-7xl"];
const MX_AUTO_PATTERN = /(^|\s)mx-auto(?=\s|$)/;
const TARGET_WIDTH_PATTERN = /(^|\s)max-w-(?:md|xl|2xl|3xl|4xl)(?=\s|$)/g;
const CLASS_NAME_PATTERN = /\bclassName\s*=\s*(["'`])([\s\S]*?)\1/g;

export function unifyContainerWidth(source) {
  let count = 0;
  const updated = source.replace(CLASS_NAME_PATTERN, (attribute, quote, classes) => {
    if (!MX_AUTO_PATTERN.test(classes)) return attribute;

    const converted = classes.replace(TARGET_WIDTH_PATTERN, (match, whitespace) => {
      count += 1;
      return `${whitespace}max-w-5xl`;
    });
    return `className=${quote}${converted}${quote}`;
  });

  return { changed: count > 0, source: updated, count };
}

function isDs009Violation(source) {
  return COMPLIANT_WIDTHS.every((width) => !source.includes(width));
}

function resolveAppFiles(appNames) {
  if (appNames.length === 0) {
    return globSync(path.join(ROOT_DIR, "apps", "*", "src", "App.tsx"))
      .sort()
      .filter((file) => isDs009Violation(readFileSync(file, "utf8")));
  }

  const invalidNames = appNames.filter((name) => !/^[a-z0-9-]+$/.test(name));
  if (invalidNames.length > 0) {
    throw new Error(`不正なアプリ名です: ${invalidNames.join(", ")}`);
  }

  return appNames.map((name) => path.join(ROOT_DIR, "apps", name, "src", "App.tsx"));
}

function main() {
  const appNames = process.argv.slice(2);
  let files;
  try {
    files = resolveAppFiles(appNames);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  let changedFiles = 0;
  let totalReplacements = 0;
  const manualApps = [];

  for (const file of files) {
    const appName = path.basename(path.dirname(path.dirname(file)));
    let original;
    try {
      original = readFileSync(file, "utf8");
    } catch {
      console.error(`${appName}: App.tsx が見つかりません`);
      process.exitCode = 1;
      continue;
    }

    if (!isDs009Violation(original)) {
      console.log(`${appName}: 準拠済みのため変更なし`);
      continue;
    }

    const result = unifyContainerWidth(original);
    if (result.count !== 1) {
      manualApps.push(appName);
      console.log(`${appName}: 要個別対応（主コンテナ候補 ${result.count} 件）`);
      continue;
    }

    writeFileSync(file, result.source);
    changedFiles += 1;
    totalReplacements += result.count;
    console.log(`${appName}: 1 件置換`);
  }

  console.log(`処理: ${files.length} アプリ`);
  console.log(`変更: ${changedFiles} ファイル / 置換: ${totalReplacements} 件`);
  console.log(
    manualApps.length > 0
      ? `要個別対応 (${manualApps.length}): ${manualApps.join(", ")}`
      : "要個別対応 (0): なし",
  );
}

if (process.argv[1]?.endsWith("unify-container-width.js")) {
  main();
}
