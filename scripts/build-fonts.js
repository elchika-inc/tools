import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// 取り込むファミリとウェイト。elchika-ui 配布 tokens.css が指定する
// IBM Plex Sans JP / Sans / Mono の 400/500/600 に対応する。
const FAMILIES = [
  { pkg: "@fontsource/ibm-plex-sans-jp", weights: ["400", "500", "600"] },
  { pkg: "@fontsource/ibm-plex-sans", weights: ["400", "500", "600"] },
  { pkg: "@fontsource/ibm-plex-mono", weights: ["400", "500", "600"] },
];

const OUT_DIR = path.resolve(process.cwd(), "packages/router/public/fonts");

/**
 * fontsource の CSS を共有配信用に書き換える。
 * - url(./files/X.woff2) を url(/fonts/X.woff2) へ（router が public/fonts を配信する）
 * - woff フォールバックを削除（woff2 のみで全モダンブラウザを賄え、配信サイズが約半分になる）
 */
export function rewriteFontFaceCss(cssText) {
  return cssText
    .replace(/,\s*url\(\.\/files\/[^)]+\.woff\)\s*format\('woff'\)/g, "")
    .replace(/url\(\.\/files\/([^)]+)\)/g, "url(/fonts/$1)");
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const chunks = [];
  let copied = 0;

  for (const { pkg, weights } of FAMILIES) {
    const pkgDir = path.resolve(process.cwd(), "node_modules", pkg);
    const referencedFiles = new Set();
    for (const weight of weights) {
      const cssPath = path.join(pkgDir, `${weight}.css`);
      const css = rewriteFontFaceCss(readFileSync(cssPath, "utf8"));
      chunks.push(css);
      for (const match of css.matchAll(/url\(\/fonts\/([^)]+\.woff2)\)/g)) {
        referencedFiles.add(match[1]);
      }
    }
    // 選択したウェイトの CSS が参照する woff2 のみコピーする
    const filesDir = path.join(pkgDir, "files");
    for (const file of readdirSync(filesDir)) {
      if (!referencedFiles.has(file)) continue;
      copyFileSync(path.join(filesDir, file), path.join(OUT_DIR, file));
      copied++;
    }
  }

  const header = "/* 自動生成: scripts/build-fonts.js。直接編集しない。 */\n";
  writeFileSync(path.join(OUT_DIR, "fonts.css"), header + chunks.join("\n"));
  console.log(`fonts.css を出力し woff2 を ${copied} 個コピーしました`);
}

// テストからの import 時は実行しない
if (process.argv[1] && process.argv[1].endsWith("build-fonts.js")) {
  main();
}
