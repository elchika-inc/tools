# elchika-ui 全アプリ展開 PR1（フォント配信の共有化）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** IBM Plex フォントを `packages/router/public/fonts/` に1セット集約し、各アプリの CSS へバンドルさせずに共有配信することで、345アプリ展開を可能にするサイズ基盤を作る。

**Architecture:** フォント生成スクリプトが fontsource から woff2 と `@font-face` 定義を抽出して `public/fonts/` に出力する。各アプリは `index.html` の `<link>` で `/fonts/fonts.css` を参照し、CSS バンドルを経由しない。url-encoder をこの方式へ移行して効果を実測する。

**Tech Stack:** Node.js スクリプト / fontsource (IBM Plex) / Vite+ (`vp`) / Cloudflare Workers Static Assets / Hono router

**Spec:** `docs/superpowers/specs/2026-08-09-elchika-ui-rollout-design.md`（承認済み。判断に迷ったら spec が正）

## 実測により確定した方式（spec も同内容に更新済み — 2026-08-09）

設計書は「`fonts.css` を作り `tokens.css` から `@import` する」と書いているが、**この方法では目的を達成できない**ことが実測でわかった。

現行 url-encoder の CSS（565,701 バイト）には `@font-face` 定義がインライン展開されている。これは `@fontsource/*` を CSS の `@import` で読んでいる結果であり、**Vite/Tailwind は `@import` をビルド時にインライン化する**。したがって `fonts.css` を `@import` に置き換えても、各アプリの CSS は 566KB のまま変わらない。

**採用する方法**: `public/fonts/fonts.css` を各アプリの `index.html` から `<link rel="stylesheet" href="/fonts/fonts.css">` で参照する。絶対 URL の外部参照は Vite がバンドルしないため、CSS は 30KB 台に戻り、フォント定義はドメイン全体で1回だけ読まれる（ブラウザキャッシュも共有される）。

あわせて実測した内訳（現行 url-encoder の assets）:

| 種別 | 個数 | サイズ |
|---|---|---|
| `.woff` | 380 | 4.97 MB |
| `.woff2` | 378 | 4.48 MB |
| `.css` | 1 | 0.54 MB |
| `.js` | 1 | 0.26 MB |

`.woff` は woff2 のフォールバックで、モダンブラウザでは一切使われない。**woff2 のみを配信対象とする**（これだけで約 5MB 削減）。

## Global Constraints

- **指示（この計画・spec）と実態が矛盾したら、勝手に直さず `orca orchestration ask` で司令塔へ報告して指示を待つ**
- 裁量範囲: 公開シグネチャと完了条件は変えない。計画に無い変更はすべて `worker_done` と PR 本文で申告する
- レビューサイクルは worker 側で完結する（確信度80%以上の指摘が0になるまで修正→再レビュー、上限3ラウンド）
- **このPRで触ってよいのは url-encoder のみ**。他 345 アプリには触れない（PR2 の範囲）
- `apps/*/vite.config.ts` は触らない・整形しない（`base: './'` 維持）
- `*.md` と `tokens.css` 系ファイルを Oxfmt で整形しない
- **検証の前に必ずリポジトリルートで `pnpm install` を実行する**（未同期だと `@base-ui/react` 解決失敗で偽の失敗が出る — 実測済み）
- テストはリポジトリルートから `pnpm exec vp test <パス>`（`pnpm --filter` の test 実行は DOM テストが全滅する既知の罠）
- lint/format は変更ファイルを明示列挙した `pnpm exec vp check <paths...>`（リポ全体の `pnpm check` は既存 issue で必ず落ちる）
- 検証コマンドを `;` / `&&` / pipe で連結しない。`rm -rf` は使わない（`git rm -r` を使う）
- コミットは `git add <明示パス>` で行う

---

### Task 1: フォント生成スクリプト

**Files:**
- Create: `scripts/build-fonts.js`
- Test: `scripts/__tests__/buildFonts.test.ts`

**Interfaces:**
- Produces: `scripts/build-fonts.js` が実行されると
  `packages/router/public/fonts/` に woff2 群と `fonts.css` を出力する。
  `fonts.css` 内の `src` はすべて `url(/fonts/<filename>.woff2) format('woff2')` の絶対パス。
  純粋関数 `rewriteFontFaceCss(cssText: string): string` を export し、テスト対象とする

- [ ] **Step 1: 変換ロジックの失敗するテストを書く**

`scripts/__tests__/buildFonts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { rewriteFontFaceCss } from "../build-fonts.js";

describe("rewriteFontFaceCss", () => {
  it("相対 files パスを /fonts/ の絶対パスへ書き換える", () => {
    const input = `@font-face {
  font-family: 'IBM Plex Sans JP';
  src: url(./files/ibm-plex-sans-jp-0-400-normal.woff2) format('woff2'), url(./files/ibm-plex-sans-jp-0-400-normal.woff) format('woff');
  unicode-range: U+25ee8;
}`;
    const out = rewriteFontFaceCss(input);
    expect(out).toContain("url(/fonts/ibm-plex-sans-jp-0-400-normal.woff2) format('woff2')");
  });

  it("woff フォールバックを落とす（モダンブラウザは woff2 のみ使う）", () => {
    const input = `src: url(./files/a.woff2) format('woff2'), url(./files/a.woff) format('woff');`;
    const out = rewriteFontFaceCss(input);
    expect(out).not.toContain(".woff)");
    expect(out).not.toContain("format('woff')");
  });

  it("unicode-range と font-family は保持する", () => {
    const input = `@font-face {
  font-family: 'IBM Plex Mono';
  font-weight: 600;
  src: url(./files/m.woff2) format('woff2'), url(./files/m.woff) format('woff');
  unicode-range: U+0000-00FF;
}`;
    const out = rewriteFontFaceCss(input);
    expect(out).toContain("font-family: 'IBM Plex Mono'");
    expect(out).toContain("font-weight: 600");
    expect(out).toContain("unicode-range: U+0000-00FF");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm exec vp test scripts/__tests__/buildFonts.test.ts
```
Expected: FAIL（`build-fonts.js` が存在しない / `rewriteFontFaceCss` が未定義）

- [ ] **Step 3: スクリプトを実装**

`scripts/build-fonts.js`:

```js
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
    for (const weight of weights) {
      const cssPath = path.join(pkgDir, `${weight}.css`);
      chunks.push(rewriteFontFaceCss(readFileSync(cssPath, "utf8")));
    }
    // woff2 のみコピーする
    const filesDir = path.join(pkgDir, "files");
    for (const file of readdirSync(filesDir)) {
      if (!file.endsWith(".woff2")) continue;
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
```

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm exec vp test scripts/__tests__/buildFonts.test.ts
```
Expected: 3 tests PASS

- [ ] **Step 5: fontsource 依存をリポジトリルートへ追加**

`@fontsource/*` は現在 `packages/design-tokens-elchika` の依存。スクリプトが
`node_modules/@fontsource/*` を読むため、`shamefully-hoist=true` によりルートから
解決できる。**まず解決可否を実測する**:

```bash
ls node_modules/@fontsource/ibm-plex-sans-jp/400.css
```
Expected: パスが表示される（exit 0）。表示されない場合は**止めて報告**（依存配置の前提が崩れている）。

- [ ] **Step 6: スクリプトを実行して出力を検証**

```bash
node scripts/build-fonts.js
```

続けて各コマンドを単独実行して確認する:

```bash
ls packages/router/public/fonts/fonts.css
```
Expected: exit 0

```bash
grep -c "fonts.googleapis" packages/router/public/fonts/fonts.css
```
Expected: 0（`grep -c` は 0 件のとき exit 1 を返す。0 が出力されることを確認する）

```bash
grep -c "url(./files/" packages/router/public/fonts/fonts.css
```
Expected: 0（相対パスが残っていない）

```bash
grep -c "format('woff')" packages/router/public/fonts/fonts.css
```
Expected: 0（woff フォールバックが残っていない）

woff2 の個数とサイズを記録する（PR 本文に載せる）:

```bash
node -e "const fs=require('fs');const d='packages/router/public/fonts';const f=fs.readdirSync(d).filter(x=>x.endsWith('.woff2'));const s=f.reduce((a,x)=>a+fs.statSync(d+'/'+x).size,0);console.log(f.length+' 個 / '+(s/1024/1024).toFixed(2)+' MB')"
```
Expected: 概ね 378 個 / 4.5 MB 前後（実測値を記録する。大きく外れたら報告）

- [ ] **Step 7: lint と commit**

```bash
pnpm exec vp check scripts/build-fonts.js scripts/__tests__/buildFonts.test.ts
```

```bash
git add scripts/build-fonts.js scripts/__tests__/buildFonts.test.ts packages/router/public/fonts
git commit -m "feat(fonts): IBM Plex を共有配信するフォント生成スクリプトを追加"
```

---

### Task 2: url-encoder を共有フォント方式へ移行

**Files:**
- Modify: `packages/design-tokens-elchika/design-system/tokens.css`（フォント import 行の削除）
- Modify: `packages/design-tokens-elchika/package.json`（`@fontsource/*` 依存の削除）
- Modify: `packages/design-tokens-elchika/src/__tests__/upstream-drift.test.ts`（除外条件の更新）
- Modify: `apps/url-encoder/index.html`（`<link>` の追加）
- Modify: `scripts/build-all.sh`（コピー時に `dist/fonts` を除外）
- Modify: `.gitignore`（`apps/*/public/fonts`）
- Modify: `package.json`（ルートへ `@fontsource/*` を移動）

**Interfaces:**
- Consumes: Task 1 が出力した `/fonts/fonts.css`
- Produces: url-encoder が共有フォントを参照する状態。PR2 で 345 アプリに同じ
  `<link rel="stylesheet" href="/fonts/fonts.css">` を適用する

- [ ] **Step 1: 配布 tokens.css からフォント import を削除**

`packages/design-tokens-elchika/design-system/tokens.css` にある
パイロットで入れた 9 行の `@import "@fontsource/...";` を**すべて削除**する
（置換ではなく削除。フォントは index.html の `<link>` から読み込むため、
配布物への局所編集は「フォント import 行が無い」状態になる）。

他の行は 1 文字も変えない。このファイルは整形もしない。

- [ ] **Step 2: upstream-drift テストの除外条件を更新**

`packages/design-tokens-elchika/src/__tests__/upstream-drift.test.ts` の
`isFontImport` は、upstream 側の `fonts.googleapis.com` 行とローカル側の
`@fontsource/` 行の両方を除外していた。ローカル側は削除されたため、
**upstream の CDN 行だけを除外する**形に変える:

```ts
// 意図的な局所編集(upstream の Google Fonts CDN import を削除し、共有配信 /fonts/fonts.css を
// index.html の <link> で読む方式へ変更)だけを比較から除外する
const isFontImport = (line: string): boolean => line.includes("fonts.googleapis.com");
```

ファイル 1 行目の `// @vitest-environment node` は**そのまま残す**（happy-dom の
CORS で外部 fetch が偽緑化するのを防ぐため。パイロットで実測済み）。

- [ ] **Step 3: fontsource 依存を削除**

`packages/design-tokens-elchika/package.json` の dependencies から
`@fontsource/ibm-plex-mono` / `@fontsource/ibm-plex-sans` / `@fontsource/ibm-plex-sans-jp` を削除する。

ただし Task 1 のスクリプトがこれらを読むため、**リポジトリルートの `package.json` の
devDependencies へ移す**（バージョンは `^5.3.0`）。

```bash
pnpm install
```

- [ ] **Step 4: url-encoder の index.html に link を追加**

`apps/url-encoder/index.html` の `</head>` の直前に次の 1 行を追加する:

```html
    <link rel="stylesheet" href="/fonts/fonts.css" />
```

絶対パスにするのは、`/url-encoder/` 配下から `/fonts/` を参照するため（相対パスだと
`/url-encoder/fonts/` を探して 404 になる）。Vite は絶対 URL の外部参照をバンドルしない。

- [ ] **Step 5: dev 用シンボリックリンクと build-all.sh の除外を入れる**

`vp dev` は `apps/url-encoder/public/` を静的配信するため、そこへリンクを張る:

```bash
mkdir -p apps/url-encoder/public
ln -sfn ../../../packages/router/public/fonts apps/url-encoder/public/fonts
```

`.gitignore` に追記して、生成物であるリンクをコミットしない:

```
apps/*/public/fonts
```

**重要（dry-run で実測済み）**: Vite は publicDir の中身を**実体解決して dist へコピーする**。
このままだと `dist/fonts/` に woff2 一式が入り、Step 6 の「dist 1MB 未満」が自壊し、
`packages/router/public/<app>/fonts/` として二重配置にもなる。
そこで `scripts/build-all.sh` のコピー処理（現状 31 行目付近）の直後に
`dist/fonts` を除去する 1 行を追加する:

```bash
  cp -r "$app/dist/"* "packages/router/public/$app_name/"
  rm -rf "packages/router/public/$app_name/fonts"
```

（`build-all.sh` は既存コードでも `rm -rf` を使っており、スクリプト内の記述として整合する。
worker がシェルから直接 `rm -rf` を実行するわけではない）

この方式は PR2 で 345 アプリへそのまま横展開できる（リンク作成は機械適用、
除外は build-all.sh の 1 箇所で全アプリに効く）。

- [ ] **Step 6: ビルドしてサイズ削減を実測**

```bash
cd apps/url-encoder
pnpm run build
```
Expected: exit 0

各コマンドを単独実行して確認する:

```bash
node -e "const fs=require('fs');const d='dist/assets';const f=fs.readdirSync(d);const s=f.reduce((a,x)=>a+fs.statSync(d+'/'+x).size,0);console.log(f.length+' ファイル / '+(s/1024/1024).toFixed(2)+' MB')"
```
Expected: **1MB 未満**（移行前は 12MB）。この probe は `dist/assets` のみを見る。
`dist/fonts/` はシンボリックリンク由来で別途存在するのが正常（Step 5 のとおり
`build-all.sh` と Task 3 のコピー時に除外する）。1MB を超えた場合は
`ls dist/assets` の内訳（woff / woff2 が残っていないか）を調べて報告する。

```bash
node -e "const fs=require('fs');const f=fs.readdirSync('dist/assets').find(x=>x.endsWith('.css'));console.log(f+' '+fs.statSync('dist/assets/'+f).size+' bytes')"
```
Expected: **50,000 バイト未満**（移行前は 565,701）

```bash
grep -rc "@font-face" dist/assets
```
Expected: CSS ファイルで 0 件（`@font-face` が CSS から外れたことの確認）

```bash
grep -r "fonts.googleapis" dist
```
Expected: 0 件（exit 1）

- [ ] **Step 7: テストを実行**

リポジトリルートで（**先に `pnpm install`**）:

```bash
pnpm install
```

```bash
pnpm exec vp test apps/url-encoder
```
Expected: exit 0（56 tests PASS）

```bash
pnpm exec vp test packages/design-tokens-elchika
```
Expected: exit 0（drift テストが実 HTTP で比較して PASS）

```bash
pnpm exec vp test scripts
```
Expected: exit 0

- [ ] **Step 8: dev サーバーでフォント読込を目視確認**

```bash
cd apps/url-encoder
pnpm run dev
```

**起動ログが示すポートの実値を読む**（Vite は使用中なら自動退避する）。
ブラウザで開き、DevTools で次を確認する:

- `document.fonts.check("16px 'IBM Plex Sans JP'")` が `true`
- `getComputedStyle(document.body).fontFamily` に `IBM Plex` が含まれる
- Network タブで `/fonts/*.woff2` が 200 で取得されている
- console に error / warn が出ていない

確認後、dev サーバーを停止する。

- [ ] **Step 9: lint と commit**

```bash
pnpm exec vp check apps/url-encoder/index.html packages/design-tokens-elchika/src/__tests__/upstream-drift.test.ts packages/design-tokens-elchika/package.json package.json
```

（`design-system/tokens.css` は整形禁止のため渡さない。`vp check` が
`.html` を対象外として扱う場合はリストから外し、その旨を申告する）

```bash
git add apps/url-encoder/index.html packages/design-tokens-elchika package.json pnpm-lock.yaml .gitignore scripts/build-all.sh
git commit -m "feat(url-encoder): フォントを共有配信 /fonts/fonts.css へ移行"
```

---

### Task 3: 本番反映と共有配信の実測

**Files:**
- Modify: `packages/router/public/url-encoder/`（ビルド生成物の差し替え）

- [ ] **Step 1: 生成物を router/public へ反映**

```bash
cd apps/url-encoder
pnpm run build
```

```bash
cd <リポジトリルート>
git rm -r -q packages/router/public/url-encoder
```

```bash
cp -R apps/url-encoder/dist packages/router/public/url-encoder
```

シンボリックリンク由来の `fonts` が入るため除去する（`/fonts/` は
`packages/router/public/fonts/` から配信されるので、アプリ配下には不要）:

```bash
git rm -r -q --ignore-unmatch --cached packages/router/public/url-encoder/fonts
```

```bash
node -e "const fs=require('fs');fs.rmSync('packages/router/public/url-encoder/fonts',{recursive:true,force:true});console.log('removed')"
```

```bash
ls packages/router/public/url-encoder/
```
Expected: `assets` と `index.html` のみ（`fonts` が無いこと）

```bash
git add packages/router/public/url-encoder
```

- [ ] **Step 2: アセットパス検査**

```bash
node scripts/check-asset-paths.js
```
Expected: exit 0（違反 0 件）

- [ ] **Step 3: public/ の合計サイズを記録**

```bash
du -sh packages/router/public
```
Expected: 概ね 160MB 前後（url-encoder が 12MB → 400KB 程度に縮み、fonts 4.5MB が加わる）。
実測値を PR 本文に記録する。

- [ ] **Step 4: commit と push**

```bash
git commit -m "build(router): url-encoder を共有フォント方式で再ビルド"
```

```bash
git push -u origin naoto24kawa/elchika-ui-rollout
```

- [ ] **Step 5: PR 作成**

```bash
gh pr create --repo elchika-inc/tools --title "feat(fonts): IBM Plex を共有配信へ移行（PR1: 展開の基盤）" --body "<下記を記載>"
```

PR 本文に含める: spec / この計画へのパス、Task 1-3 の実測値（woff2 個数とサイズ、
dist サイズの前後、CSS サイズの前後、public/ 合計）、テスト結果、
計画から逸れた変更の申告、「デプロイと配信実測（Step 6 以降）は司令塔が human 承認後に実施」の明記。

**worker はここで停止し、司令塔の完了ゲートを待つ。以降は司令塔が実施する。**

- [ ] **Step 6（司令塔）: マージとデプロイ**

human 承認後に PR をマージし、main で:

```bash
cd packages/router
pnpm run deploy
```

- [ ] **Step 7（司令塔）: 共有フォント配信の実測 — PR1 の中核ゲート**

`fonts.css` に実在するファイル名を1つ取り出し、実 GET する:

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://tools.elchika.app/fonts/fonts.css
```
Expected: `200 text/css`

```bash
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' https://tools.elchika.app/fonts/<実在する woff2 名>
```
Expected: `200 font/woff2`

url-encoder の HTML が `/fonts/fonts.css` を参照していることを確認する:

```bash
curl -s https://tools.elchika.app/url-encoder/ -o /tmp/deployed.html
```

```bash
grep -o -E '(src|href)="[^"]*"' /tmp/deployed.html
```
Expected: `/fonts/fonts.css` への参照が含まれる。取り出した各 URL を実 GET し、
200 かつ content-type が JS/CSS であることまで確認する。

**デプロイ直後の 404 はエッジ伝播の可能性があるため、1 回の 404 で失敗と判定しない。**
時間をおいた再取得で切り分ける。

- [ ] **Step 8（司令塔）: 全数ヘルスチェック**

```bash
node scripts/health-check-runtime.js
```
Expected: 346/346 正常。実行後に `git checkout -- .docs/health-check-result.json`

## PR1 の完了条件（rubric）

1. `pnpm exec vp test scripts` が exit 0
2. `pnpm exec vp test apps/url-encoder` が exit 0（56 tests PASS）
3. `pnpm exec vp test packages/design-tokens-elchika` が exit 0
4. url-encoder の dist が **1MB 未満**（移行前 12MB）
5. url-encoder の CSS が **50KB 未満**（移行前 565,701 バイト）、`@font-face` を含まない
6. dist に `fonts.googleapis` が 0 件
7. dev サーバーで IBM Plex が適用される（`document.fonts.check` で実測）
8. `node scripts/check-asset-paths.js` が exit 0
9. デプロイ後 `https://tools.elchika.app/fonts/fonts.css` が 200 + `text/css`、
   woff2 が 200 + `font/woff2`
10. `node scripts/health-check-runtime.js` が 346/346
11. 変更ファイルが `scripts/` / `packages/design-tokens-elchika/` /
    `packages/router/public/{fonts,url-encoder}/` / `apps/url-encoder/` /
    `docs/superpowers/` / ルート `package.json` / `pnpm-lock.yaml` / `.gitignore` のみ
12. `packages/router/public/url-encoder/` に `fonts` ディレクトリが**存在しない**
    （フォントは `packages/router/public/fonts/` の 1 セットのみ）

## PR2 の計画について

PR2（345アプリ展開）の実装計画は、**PR1 の実測値が出てから**作成する。
PR1 で確定する次の値が PR2 の期待値を決めるため:

- 1 アプリあたりの dist サイズ（`public/` 全体の見積もりの基礎）
- シンボリックリンク + `build-all.sh` 除外の組合せが機械適用できること
- 共有フォント配信が本番で機能すること
