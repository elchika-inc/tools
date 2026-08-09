# elchika-inc/ui 全アプリ展開（345アプリ）設計書

- 日付: 2026-08-09
- ステータス: 承認済み（ユーザー承認: 2026-08-09）
- 前提: パイロット（url-encoder）完了・本番反映済み
  （spec: `2026-08-09-elchika-ui-pilot-design.md` / PR #851 / merge `0fdb8d20`）

## 決定事項（ユーザー承認済み）

1. **フォント配信を共有化する**（`packages/router/public/fonts/` に1セット + 絶対パス参照）
2. **実行方式は codemod + 例外のみ worker**（変換スクリプトで一括適用し、失敗分のみ個別処理）
3. **PR は2段階**（PR1: フォント共有化の基盤 → デプロイ検証 → PR2: 345アプリ一括）
4. **PR2 に同梱する周辺作業**: Storybook story ID 衝突解消 / 各アプリ CLAUDE.md 更新 /
   focus-ring 項目の検証・消し込み / design-audit 既存違反の解消

## 実測で判明した事実（2026-08-09 実測。再調査不要）

### サイズが最大の制約

| 対象 | 実測値 |
|---|---|
| url-encoder（elchika-ui 適用後） | **12MB**（IBM Plex woff2 378個を同梱） |
| aes-encrypt（旧方式） | 372KB |
| url-encoder の CSS | raw 565,701 / gzip 261,888 バイト |
| aes-encrypt の CSS | 30,678 バイト |
| `packages/router/public/` 現状 | 166MB / 3,539 ファイル |

単純展開すると `public/` は約 4GB に膨張し、git・push・デプロイのすべてが破綻する。
CSS 増加分の大半は 378 個分の `@font-face` 定義であり、フォントを共有化して
`@font-face` を1つの CSS に集約すれば各アプリの CSS は 30KB 台へ戻る見込み。
**フォント共有化は最適化ではなく展開の必要条件**である。

### コンポーネントはバイト単位でほぼ同一

`md5` 実測: `button.tsx` は 344 ファイル中 **339 が完全同一**。他も同様。

| コンポーネント | ユニーク版数 / 総ファイル数 |
|---|---|
| button | 5 / 344 |
| card | 5 / 345 |
| label | 5 / 345 |
| input | 4 / 340 |
| select | 4 / 326 |
| toast | 3 / 333 |
| toaster | 2 / 332 |
| useToast.ts | 2 / (333 相当) |

→ コンポーネントは「変換」ではなく **url-encoder 成果物によるファイル置換**で足りる。

### toast API は3プロパティのみ

brace balance で 909 コールサイトを再集計した結果:

| プロパティ組合せ | 件数 |
|---|---|
| `title` のみ | 404 |
| `title` + `variant` | 363 |
| `title` + `description` + `variant` | 79 |
| `title` + `description` | 18 |
| （その他 = 日本語文字列内コロンによる誤検出） | 約 10 |

`variant` の値は `destructive` 475 件と `success` 3 件のみ。
当初 35 件見えた `message` prop は**実在しない**（`message:` を含む tsx は 0 件で裏取り済み）。

**変換表（確定）**:

| 変換前 | 変換後 |
|---|---|
| `toast({ title })` | `toast.add({ title })` |
| `toast({ title, description })` | `toast.add({ title, description })` |
| `toast({ ..., variant: "destructive" })` | `toast.add({ ..., type: "error" })` |
| `toast({ ..., variant: "success" })` | `toast.add({ ..., type: "success" })` |

**変換は AST ベース（ts-morph）で行う（MUST）**。regex は上記の誤検出（約10件）を
そのまま変換に持ち込み、333 アプリのコードを壊す。複数行のコールサイトが 107 件あることも
regex を不適とする理由。

### その他の分布

- コンポーネント数分布: 7個 = 309アプリ / 6個 = 14 / 5個 = 12 / 8個 = 7 / 4個 = 2 / 9個 = 1 / 1個 = 1
- 少数派コンポーネント: textarea 10 / switch 4 / slider 2 アプリ
- **`.dark` クラス駆動の切替機構を持つアプリは `syntax-highlight` の1件のみ**
- Radix 依存: 345 アプリ

### router は `/fonts/` を配信できる

`packages/router/src/index.ts:32` の `app.all('*')` が全パスを `ASSETS.fetch` へ流す。
拡張子付きパスは `:39` の trailing-slash リダイレクトにも掛からない。
`/fonts/nonexistent.woff2` が router の 404 JSON を返すことで**経路自体は通っている**ことを確認済み
（実ファイルの配信は PR1 のデプロイで実測する）。
`wrangler.toml` の `[assets] directory = "./public"` により `public/fonts/` はそのまま配信対象。

### テストのベースライン（重要）

**リポ全体テストは移行前から失敗している。** `pnpm install` で依存を同期した状態で:

```
Test Files  12 failed | 688 passed (700)
Tests  7 failed | 6850 passed | 5 skipped (6862)   → exit 1
```

既存失敗（本移行と無関係。直さない）:
`bcrypt-hash` / `file-rename-batch`(2) / `geo-distance` / `hash-crc32` / `hash-md5` /
`k8s-yaml-generator` / `markdown-to-slides` / `nato-phonetic` / `sql-playground` /
`zip-creator` / `packages/mcp-server` / `packages/router`（`should return 404 for unknown paths`
が expected 301 to be 404 で失敗 — PR1 で router に触れる際に巻き込まないよう注意）。

**落とし穴**: `pnpm install` 前は url-encoder の 4 ファイルが
`Failed to resolve import "@base-ui/react/button"` で追加失敗する。これは
main checkout の `node_modules` が lockfile と未同期なだけで、コードの問題ではない。
**検証の前に必ず `pnpm install` を実行すること。**

### design-audit の既存違反

全アプリ監査の実測: **1,161 件 / 336 アプリが違反**（clean は 10 アプリのみ）。

| ルール | 件数 | 内容 | 機械化 |
|---|---|---|---|
| DS-004 | 577 | 任意カラークラス直書き → トークン | 一部のみ |
| DS-002 | 366 | ヘッダーのバックリンク・h1・説明文 | 可能 |
| DS-009 | 181 | コンテナ `max-w-5xl/6xl/7xl` | 可能 |
| DS-001 / DS-003 / DS-010 | 42 | — | 概ね可能 |

## PR1: フォント配信の共有化（基盤）

### 実測により確定した方式（2026-08-09 dry-run 実施。当初案から2点変更）

**変更1: CSS の `@import` ではなく `index.html` の `<link>` で読む。**

当初案は `fonts.css` を作り `tokens.css` から `@import` する方式だったが、
**Vite / Tailwind は `@import` をビルド時にインライン化する**ため、各アプリの CSS は
566KB のまま変わらず目的を達成できない。現行 url-encoder の CSS（565,701 バイト）に
`@font-face` が展開されている事実がその実証にあたる。

採用する方式: `public/fonts/fonts.css` を各アプリの `index.html` から
`<link rel="stylesheet" href="/fonts/fonts.css">` で参照する。絶対 URL の外部参照は
Vite がバンドルしないため CSS は 30KB 台へ戻り、フォント定義はドメイン全体で
1 回だけ読まれる（ブラウザキャッシュも共有される）。
配布 `tokens.css` へのフォント import は**削除**し、局所編集は「無し」の状態にする。

**変更2: woff フォールバックを配信しない。**

現行 url-encoder の assets 内訳（実測）は `.woff` 380 個 4.97MB / `.woff2` 378 個 4.48MB /
`.css` 0.54MB / `.js` 0.26MB。`.woff` は woff2 のフォールバックでモダンブラウザでは
一切使われないため、**woff2 のみを配信対象とする**（これだけで約 5MB 削減）。

**dev サーバーでの `/fonts/` 解決**: `apps/<app>/public/fonts` を
`packages/router/public/fonts` へのシンボリックリンクにすると dev では解決されるが、
**Vite は publicDir の中身を実体解決して dist へコピーする**（dry-run で確認。
dist に fonts 一式が入り「dist 1MB 未満」の条件が自壊する）。
そこで **`scripts/build-all.sh` のコピー処理で `dist/fonts` を除外する**。
これにより dev はフォントが効き、`packages/router/public/<app>/` には二重配置されない。

### 変更内容

1. `scripts/build-fonts.js` を新規作成し、fontsource から woff2 と `@font-face` を抽出して
   `packages/router/public/fonts/`（woff2 群 + `fonts.css`）へ出力する
2. `packages/design-tokens-elchika/design-system/tokens.css` から
   パイロットで入れた 9 行の `@fontsource/...` import を**削除**する
3. `upstream-drift.test.ts` の除外条件を「upstream の `fonts.googleapis.com` 行のみ」に更新する
4. `@fontsource/*` 依存を `packages/design-tokens-elchika/package.json` から
   リポジトリルートの devDependencies へ移す（生成スクリプトが読むため）
5. `apps/url-encoder/index.html` に `<link rel="stylesheet" href="/fonts/fonts.css" />` を追加
6. `apps/url-encoder/public/fonts` をシンボリックリンクとして作成し `.gitignore` に追加
7. `scripts/build-all.sh` のコピー処理で `dist/fonts` を除外する

### PR1 の完了条件

1. url-encoder の build 後サイズが **12MB → 1MB 未満**（`dist/fonts` を除いた値。実測して記録）
2. url-encoder の CSS が **566KB → 50KB 未満**（`@font-face` が外部化されたことの確認）
3. `pnpm exec vp test apps/url-encoder` が exit 0
4. `pnpm exec vp test packages/design-tokens-elchika`（drift テスト）が exit 0
5. `pnpm exec vp test packages/router` の失敗が**ベースラインと同一**（1 件のみ）
6. デプロイ後、`https://tools.elchika.app/fonts/<実ファイル名>` が
   **200 + `font/woff2`** を返す（フォント共有配信の実測 — ここが PR1 の中核ゲート）
7. `https://tools.elchika.app/url-encoder/` の CSS が `/fonts/` を参照し、
   参照先が実 GET で 200 + `font/woff2`
8. `node scripts/health-check-runtime.js` が 346/346
9. dev サーバー（`vp dev`）でフォントが読み込まれること（computed font-family で実測）

## PR2: 345アプリ展開

### 実行順序（カナリア先行）

1. **Storybook の story ID 衝突を解消する**（最初に実施）
   stories の `title` をアプリ名 prefix 付きに変更する codemod。
   これによりパイロットで実測できなかった Select の目視が可能になる。
   展開後は 326 アプリが Select を載せるため、見える状態を先に作る
2. **カナリア 1 アプリ**（Select を App 本体で使うアプリを1つ選定）を移行し、
   Storybook と実画面の両方で目視確認する
3. **外れ値 5〜10 アプリで dry-run**（コンポーネント数が 1個 / 4個 / 9個のアプリ、
   textarea / switch / slider を持つ 16 アプリから抽出）。
   309 アプリはテンプレ同型のため、壊れるのは分布の端に集中する。
   dry-run の結果を見てから残りの期待値を確定する
4. 残りを一括適用 → build / test が失敗したアプリのみ Codex worker が個別処理
5. **`syntax-highlight` は codemod 対象外**とし、worker が個別に処理する
   （唯一の `.dark` クラス駆動アプリ。elchika-ui は `data-theme="dark"` 駆動のため
   切替機構の書き換えが必要）

### コミット分離（bisect 可能性の確保）

`public/` 再生成は数百 MB 級の diff になる（166MB の大半のハッシュが変わる）。
レビューは src 側の diff のみを対象とし、実ゲートは health-check 346/346 とする。

1. Storybook story ID 修正
2. コンポーネント置換 + トークン切替
3. toast の AST 変換
4. 各アプリ CLAUDE.md 更新
5. design-audit 違反修正
6. `public/` 再生成

### design-audit 違反の扱い

- **DS-002（366件）と DS-009（181件）は codemod で修正する**
- **DS-004（577件）は機械化できる分のみ**処理する
  （既知パレット → トークンの 1 対 1 対応が確定できるもの）。
  判断が要る残りは**件数を報告し、扱いはその時点で決める**。
  全部を PR2 に押し込むと移行起因の問題と切り分けられなくなるため
- DS-001 / DS-003 / DS-010（42件）は可能な範囲で修正する

### 各アプリ CLAUDE.md 更新

陳腐化した記載（React 18 / bun / Biome / Radix / Vite 6 / Cloudflare Pages）を
実態（React 19 / pnpm・vp / Oxlint・Oxfmt / Base UI / Vite+ / Workers + Static Assets）へ
機械更新する。url-encoder の CLAUDE.md がこの陳腐化の実例。

### focus-ring 項目の消し込み

Action Queue の `next-session-focus-ring-standards.md`（344 アプリ）は
elchika-ui 移行で standards §5 準拠になる見込み。**展開後に実測で確認**し、
解消していれば `actionctl done` で消し込む（作業は検証のみ。修正は含めない）。

## PR2 の完了条件

1. 全 346 アプリの build が成功（`bash scripts/build-all.sh` が exit 0）
2. `pnpm install` 実行後の `pnpm exec vp test` の失敗が**ベースライン
   （12 files / 7 tests）と同一以下**。新規失敗が 1 件でもあれば未完了
3. `node scripts/check-asset-paths.js` が exit 0
4. `packages/router/public/` のサイズが **200MB 未満**（実測して記録）
5. デプロイ後 `node scripts/health-check-runtime.js` が **346/346**
6. 全アプリの dist に `fonts.googleapis` が 0 件
7. `node scripts/design-audit.js` の違反が、DS-004 の報告済み残件を除き
   **ベースライン 1,161 件から減少**していること
8. カナリアアプリと `syntax-highlight` の**目視動作確認**
   （toast 表示・Select 開閉・dark 切替が操作して反応するところまで）
9. Storybook が起動し、Select story の開閉が動作すること

## スコープ外

- `scripts/create-app.js` とテンプレートの elchika-ui 対応（展開完了後に別サイクル）
- DS-004 のうち機械化できない残件（件数報告後に判断）
- 既存テスト失敗 12 files / 7 tests の修正（移行と無関係の既存問題）
- `packages/router` の `should return 404 for unknown paths` 失敗の修正（同上）
