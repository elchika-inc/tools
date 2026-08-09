#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const targetDir = process.argv[2];
if (!targetDir) {
  console.error("使い方: node scripts/fix-font-link.js <build-directory>");
  process.exit(1);
}

const htmlPath = path.join(targetDir, "index.html");
if (!fs.existsSync(htmlPath)) {
  console.error(`index.html が存在しません: ${htmlPath}`);
  process.exit(1);
}

const before = fs.readFileSync(htmlPath, "utf8");
const from = 'href="./fonts/fonts.css"';
const to = 'href="/fonts/fonts.css"';
const replacements = before.split(from).length - 1;
fs.writeFileSync(htmlPath, before.replaceAll(from, to));
console.log(`${htmlPath}: フォント参照を ${replacements} 件書き換えました`);
