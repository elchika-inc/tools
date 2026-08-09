# 本番で動かない2アプリの修正 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 本番で JS が動作しない `morpheme-analyzer`（完全な白画面）と `sql-playground`（DB 初期化失敗）を、根本原因に対処して復旧する。

**Architecture:** 2件は独立した別の原因。morpheme-analyzer は zlibjs（UMD 前提の古いライブラリ）が ESM バンドル下で `this === undefined` になる問題。sql-playground はブラウザ版 sql.js が要求する wasm のファイル名と配置名の不一致。

**Tech Stack:** Vite+ (Vite 8 + Rolldown) / kuromoji + zlibjs / sql.js 1.14.1

**発見の経緯:** elchika-ui 移行（PR #852〜#856）完了後、司令塔が Playwright で本番の全346アプリを開いて JS 実行を検証したところ2件が異常だった。**いずれも移行前から壊れている**ことを実測で確認済み（`git archive 570ec3e6` の成果物をローカル配信して同じエラーを再現）。移行起因ではない既存不具合。

## 根本原因（司令塔が Phase 1-2 で特定済み。再調査不要）

### 1. morpheme-analyzer — zlibjs の `this` がモジュールスコープで undefined

エラー: `TypeError: Cannot use 'in' operator to search for 'Zlib' in undefined`
（`#root` の子要素0 / innerHTML 0バイト = 完全な白画面）

依存の連鎖:
- `apps/morpheme-analyzer/src/utils/morpheme.ts:19` が `kuromoji.builder({ dicPath }).build(...)`
- `node_modules/kuromoji/package.json` の `browser` フィールドが
  `NodeDictionaryLoader.js` → `BrowserDictionaryLoader.js` に差し替え
- `BrowserDictionaryLoader.js:20` が `require("zlibjs/bin/gunzip.min.js")`
- 同 `:50` で `new zlib.Zlib.Gunzip(...)` を**同期呼び出し**

`zlibjs/bin/gunzip.min.js` の冒頭（実測）:

```js
(function() {'use strict';
  function n(e){throw e;}
  var p=void 0, aa=this;              // ← グローバルを this から取得
  function t(e,b){
    var d=e.split("."), c=aa;
    !(d[0] in c) && c.execScript && ...  // ← c が undefined で TypeError
  }
```

`var aa = this` は**非 ESM（スクリプト/CJS）で `this` がグローバルオブジェクトを指す**ことに依存する。
ESM のモジュールスコープでは `this` は **`undefined`**（司令塔が `node --input-type=module` で実測確認）。
そのため `aa` が undefined になり、`t("Zlib.Gunzip", ...)` の `d[0] in c` で例外。
エラーメッセージの `'Zlib'` は `e.split(".")[0]` と一致しており、この経路で確定。

**つまり zlibjs が ESM として扱われていることが原因。CJS として正しく変換されれば
`aa = exports` になり、`exports.Zlib.Gunzip` が kuromoji の期待どおり解決される。**

### 2. sql-playground — ブラウザ版が要求する wasm 名と配置名の不一致

エラー: `wasm streaming compile failed` → `Failed to initialize database`

- `apps/sql-playground/src/utils/sqlEngine.ts:19-20` が
  `initSqlJs({ locateFile: (file) => './' + file })`
- ブラウザ版 sql.js が要求するのは **`sql-wasm-browser.wasm`**（本番の console エラーで実測）
- 配置されているのは `apps/sql-playground/public/sql-wasm.wasm` のみ
- 本番で `https://tools.elchika.app/sql-playground/sql-wasm.wasm` は 200 だが、
  実際に要求される `sql-wasm-browser.wasm` が無いため 404

**重要な実測**: sql.js 1.14.1 の `dist/sql-wasm.wasm` と `dist/sql-wasm-browser.wasm`、
および現在配置中の `public/sql-wasm.wasm` は**3つとも md5 が同一**（`6b0f91e4...`、659,730 バイト）。
**中身は同じでファイル名だけが違う。**

## Global Constraints

- **指示（この計画）と実態が矛盾したら、勝手に直さず `orca orchestration ask` で司令塔へ報告して指示を待つ**
- 裁量範囲: 公開シグネチャと完了条件は変えない。計画に無い変更はすべて `worker_done` と PR 本文で申告する
- レビューサイクルは worker 側で完結する（確信度80%以上の指摘が0になるまで修正→再レビュー、上限3ラウンド）
- **対象は `morpheme-analyzer` と `sql-playground` の2アプリのみ。他344アプリに触れない**
- **`vp check` を整形込みで実行しない**（2026-08-09 に5,486件の汚染事故が発生）。
  lint/type は `pnpm exec vp check --no-fmt <パス>` のみを使う。
  実行後は必ず `git status --porcelain` の件数を確認し、想定外なら即停止して報告する
- `*.md` と `packages/design-tokens-elchika/` 配下を整形しない
- **検証の前に必ずリポジトリルートで `pnpm install` を実行する**
- テストはリポジトリルートから `pnpm exec vp test <パス>`
- 検証コマンドを `;` / `&&` / pipe で連結しない。シェルから直接 `rm -rf` を実行しない
- コミットは `git add <明示パス>` で行う

## ベースライン（司令塔が実測済み）

```
pnpm install 実行後の pnpm exec vp test:
  Test Files  12 failed
  Tests  7 failed | 6888 passed | 5 skipped   → exit 1
```

既存失敗12件には **`sql-playground`（`ENOENT: './sql-wasm.wasm'`）が含まれる**。
本 PR の修正でこれが解消する可能性があり、その場合は失敗が減る（**減るのは歓迎**）。
`morpheme-analyzer` はベースラインの失敗リストに**含まれない**（ユニットテストは Node 環境で
`NodeDictionaryLoader` を使うため通っている。ブラウザでのみ壊れる）。

その他: `build-all.sh` 346/346 / `check-asset-paths.js` exit 0 /
`health-check-runtime.js` 346/346 / `design-audit.js` 579件 / `public/` 144MB

---

### Task 1: sql-playground の wasm 名不一致を修正

**Files:**
- Create: `apps/sql-playground/public/sql-wasm-browser.wasm`
- Delete: `apps/sql-playground/public/sql-wasm.wasm`（誰も要求していないため）

こちらを先にやる。原因が単純で、修正の効果を早く確認できる。

- [ ] **Step 1: 失敗を再現する**

```bash
cd apps/sql-playground
pnpm run build
```

```bash
pnpm exec vite preview --port 5199
```

**起動ログのポート実値を読む**。ブラウザで開き、console に
`Failed to initialize database` と wasm の 404 が出ること、
SQL を実行しようとしても結果が出ないことを確認する。

**再現しない場合は止めて報告する**（前提が崩れている）。

確認後、preview を停止する。

- [ ] **Step 2: 正しい名前で wasm を配置する**

```bash
cp node_modules/sql.js/dist/sql-wasm-browser.wasm apps/sql-playground/public/sql-wasm-browser.wasm
```

```bash
git rm -q apps/sql-playground/public/sql-wasm.wasm
```

（3ファイルは md5 同一なので中身の心配は不要。名前だけを合わせる）

- [ ] **Step 3: 修正を検証する**

```bash
cd apps/sql-playground
pnpm run build
```

```bash
ls dist/
```
Expected: `sql-wasm-browser.wasm` があり、`sql-wasm.wasm` が無い

```bash
pnpm exec vite preview --port 5199
```

ブラウザで開き、**実際に SQL を実行して結果が返ること**を確認する:

- console に `Failed to initialize database` が出ない
- wasm の 404 が出ない
- `SELECT 1+1 AS answer;` のようなクエリを入力して実行し、**結果テーブルに 2 が表示される**
- テーブル作成 → INSERT → SELECT の一連が動く

**「エラーが出ない」だけで合格にしない。実際にクエリが実行できるところまで確認する。**

確認後、preview を停止する。

- [ ] **Step 4: ユニットテスト**

リポジトリルートで:

```bash
pnpm exec vp test apps/sql-playground
```

ベースラインでは `ENOENT: './sql-wasm.wasm'` で失敗していた。
結果を記録する（PASS に変わっていれば改善、失敗が残るなら内容を確認して報告）。

- [ ] **Step 5: commit**

```bash
git add apps/sql-playground/public
git commit -m "fix(sql-playground): ブラウザ版 sql.js が要求する wasm 名に合わせる"
```

---

### Task 2: morpheme-analyzer の zlibjs 問題を修正

**Files:**
- Modify: `apps/morpheme-analyzer/vite.config.ts`

**この計画は対策を1つに決め打ちしない。** 下記の候補を**順に1つずつ**試し、
効いたものを採用する（systematic-debugging の「一度に1つの仮説」）。

- [ ] **Step 1: 失敗を再現する**

```bash
cd apps/morpheme-analyzer
pnpm run build
```

```bash
pnpm exec vite preview --port 5198
```

**起動ログのポート実値を読む**。ブラウザで開き、次を確認する:

- console に `Cannot use 'in' operator to search for 'Zlib' in undefined` が出る
- `document.getElementById('root').children.length` が **0**（白画面）

**再現しない場合は止めて報告する。**

確認後、preview を停止する。

- [ ] **Step 2: 候補A — zlibjs を CJS として明示的に扱わせる**

`apps/morpheme-analyzer/vite.config.ts` の `build` に次を追加する:

```ts
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    commonjsOptions: {
      // zlibjs は UMD 前提の古いライブラリで、モジュールスコープの this が
      // グローバルを指すことに依存している。ESM として扱われると this が
      // undefined になり "Cannot use 'in' operator" で落ちるため、
      // CJS として変換させる。
      transformMixedEsModules: true,
      include: [/zlibjs/, /kuromoji/, /node_modules/],
    },
  },
```

ビルドして preview で確認する（Step 1 と同じ手順）。
**`root.children.length > 0` になり、日本語テキストを入力して形態素解析の結果が表出るか**まで確認する。

効いたら Step 5 へ。効かなければ Step 3 へ（**この変更は元に戻してから次を試す**）。

- [ ] **Step 3: 候補B — optimizeDeps で事前バンドルさせる**

候補A を戻したうえで、`vite.config.ts` に次を追加する:

```ts
  optimizeDeps: {
    include: ['kuromoji', 'zlibjs/bin/gunzip.min.js'],
  },
```

同様にビルドして preview で確認する。効いたら Step 5 へ、効かなければ Step 4 へ。

- [ ] **Step 4: 候補C — グローバル参照を補う**

候補B を戻したうえで、`vite.config.ts` に次を追加する:

```ts
  define: {
    // zlibjs が参照するモジュールスコープの this を globalThis へ寄せる。
    // 影響範囲を限定するため、このアプリの vite.config でのみ設定する。
    global: 'globalThis',
  },
```

これでも効かない場合、**3案すべて失敗した時点で止めて司令塔へ報告する**
（systematic-debugging の規律: 3回失敗したらアーキテクチャを疑う）。
その際、各案で観測されたエラーの違いを記録して報告すること。

- [ ] **Step 5: 採用した案で最終確認**

```bash
cd apps/morpheme-analyzer
pnpm run build
```

```bash
pnpm exec vite preview --port 5198
```

ブラウザで次を確認する:

- console に `Zlib` のエラーが出ない
- `document.getElementById('root').children.length` が **1以上**
- **日本語テキスト（例:「すもももももももものうち」）を入力して形態素解析を実行し、
  品詞・読み・原形のテーブルが表示される**
- 辞書ファイル（`dict/*.gz`）の取得が 200 で成功している（Network タブ）

**「白画面でなくなった」だけで合格にしない。形態素解析が実際に動くところまで確認する。**

- [ ] **Step 6: ユニットテスト**

リポジトリルートで:

```bash
pnpm exec vp test apps/morpheme-analyzer
```
Expected: exit 0（ベースラインで失敗していないため、PASS を維持すること）

- [ ] **Step 7: commit**

```bash
pnpm exec vp check --no-fmt apps/morpheme-analyzer/vite.config.ts
```

**注意**: `vite.config.ts` は通常「触らない・整形しない」対象だが、本 PR は
このファイルの**機能修正が目的**なので変更してよい。ただし整形はしない
（`--no-fmt` を使い、`--fix` を当てない）。`base: './'` は変更しないこと。

```bash
git add apps/morpheme-analyzer/vite.config.ts
git commit -m "fix(morpheme-analyzer): zlibjs を CJS として扱い白画面を解消"
```

（コミットメッセージは採用した案に合わせて書き換えてよい）

---

### Task 3: 生成物の反映と最終検証

- [ ] **Step 1: 2アプリを再ビルドして生成物へ反映**

```bash
bash scripts/build-all.sh
```

（全アプリのビルドだが、生成物の差分は該当2アプリに限られるはず。
他アプリに差分が出たら内容を確認して報告する）

```bash
git status --porcelain packages/router/public > /tmp/fix-public-diff.txt
```

```bash
grep -c "" /tmp/fix-public-diff.txt
```

差分が `morpheme-analyzer` と `sql-playground` 以外に及んでいないか確認する:

```bash
grep -v -E "packages/router/public/(morpheme-analyzer|sql-playground)/" /tmp/fix-public-diff.txt
```
Expected: 0件（exit 1）。**他アプリに差分が出たら報告する**

- [ ] **Step 2: 全体検証**

各コマンドを単独実行する:

```bash
pnpm install
```

```bash
pnpm exec vp test
```
Expected: 失敗が**ベースライン（12 files / 7 tests）と同一以下**。
sql-playground が PASS に変われば失敗が減る（**減るのは歓迎**）。増えたら報告する

```bash
node scripts/check-asset-paths.js
```
Expected: exit 0

```bash
du -sh packages/router/public
```
Expected: 200MB 未満

- [ ] **Step 3: commit**

```bash
git add packages/router/public
git commit -m "build(router): 2アプリの修正を反映して再生成"
```

- [ ] **Step 4: push と PR 作成**

```bash
git push -u origin naoto24kawa/fix-broken-runtime
```

```bash
gh pr create --repo elchika-inc/tools --title "fix: 本番で動作しない2アプリを修正（morpheme-analyzer / sql-playground）" --body "<下記を記載>"
```

PR 本文に含める: この計画へのパス / 根本原因の説明（zlibjs の `this`、wasm 名不一致）/
**採用した対策と、試して効かなかった案があればその記録** /
rubric 各項目の実測値 / **ブラウザでの動作確認結果（形態素解析が動く・SQL が実行できる）** /
レビュー記録 / 計画から逸れた変更の申告 / 実装担当: Codex /
「これらは elchika-ui 移行前から壊れていた既存不具合」の明記 /
「マージ・デプロイは司令塔が human 承認後に実施」の明記。

**worker はここで停止し、司令塔の完了ゲートを待つ。**

## 完了条件（rubric）

1. `pnpm exec vp test` の失敗が**ベースライン（12 files / 7 tests）と同一以下**。増えていないこと
2. `bash scripts/build-all.sh` が exit 0（346/346）
3. `node scripts/check-asset-paths.js` が exit 0
4. **`morpheme-analyzer` をブラウザで開き、`#root` の子要素が1以上あり、
   日本語テキストの形態素解析が実際に動作する**（品詞テーブルが表示される）
5. **`sql-playground` をブラウザで開き、SQL クエリが実際に実行できる**
   （`SELECT 1+1` で結果が返る）
6. 両アプリの console に致命的エラー（`Zlib` / `Failed to initialize database`）が出ない
7. 変更されたファイルが `apps/{morpheme-analyzer,sql-playground}/` と
   `packages/router/public/{morpheme-analyzer,sql-playground}/` と `docs/superpowers/` のみ
8. `apps/*/vite.config.ts` の差分が `morpheme-analyzer` の1件のみ（`base: './'` は不変）
9. `packages/router/public/` が 200MB 未満
