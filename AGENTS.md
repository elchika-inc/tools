# Elchika Tools

## Project Overview

ブラウザ上で完結するクライアントサイドツール集。333個のツールを `apps/` 配下に個別SPAとして管理。

## Tech Stack

- standards_version: 2026-08-17 (rev.77)。
- branch_policy: `protected`（PR 必須で、直 push の bypass を設けない）。2026-08-17 実測: ruleset `id=20942268` / `name=main` / `enforcement=active` / 対象 `refs/heads/main` / **`bypass_actors` は空** / rules は `pull_request`（`required_approving_review_count=0`・merge / squash / rebase を許可）と `required_status_checks`（context は **`ci`** の1本・`strict_required_status_checks_policy=true`）。
- merge_policy: `auto-on-green`（owner `elchika-inc` の既定。DOCS_OPS §5 の owner 別既定表）。当リポジトリは `pnpm-lock.yaml` に加え、**コミットされたビルド成果物 `packages/router/public/`**（ファイル名ハッシュを含み、`scripts/build-all.sh` がアプリ単位で作り直す）という「正しさが base の内容に依存する成果物」を持つ。DOCS_OPS §5 はこの種の成果物を持つリポジトリが `auto-on-green` を宣言する場合、required status check と、strict 設定（Require branches to be up to date before merging）または merge queue の有効化を MUST とする（**この MUST は required status check の有無に依存しない**）。上記 ruleset の `required_status_checks`（context `ci`・`strict=true`）がこれを満たす。`allow_auto_merge` も `true`（2026-08-17 実測）。
  - **条件1 の対象 check（`ci`）は required に含まれているため、`gh pr merge --auto` を使ってよい**（§5「マージ機構」の前者）。`--auto` を使う場合は `--match-head-commit <判定時 head>` を付ける（§5 の MUST）。
  - エージェントがマージ操作を行う場合の記録（`agent-merge-verdict/*` コメント）は DOCS_OPS §5「エージェントのマージ記録（MUST）」が正本。`merge_policy` の値を問わず適用される。
- **UI**: React 19 + TypeScript (strict)
- **ビルド**: Vite+ (Vite 8 + Rolldown)
- **スタイリング**: Tailwind CSS v4 (`@tailwindcss/vite`) + elchika-inc/ui (Base UI)
  - 全 346 アプリが v4。カラートークンは elchika-ui 配布の2層トークン
    `@tools/design-tokens-elchika` を使用し、各アプリの `src/index.css` は
    `@import "@tools/design-tokens-elchika";` の 1 行のみ
  - `tailwind.config.js` / `postcss.config.js` は持たない(v4 は CSS-first 設定)
- **ランタイム**: Node.js (pnpm via Vite+ CLI `vp`)
- **Linter/Formatter**: Oxlint + Oxfmt (via `vp check`)
- **テスト**: vp test / Vitest (ユニット) + Playwright (E2E)
- **ホスティング**: Cloudflare Workers + Static Assets (1プロジェクトに統合)
- **ルーター**: Hono (packages/router)
- **モノレポ**: pnpm workspaces (`apps/*`, `packages/*`)

## Key Commands

主要ゲートは次の実在コマンドを使う。

- test: リポジトリルートで `pnpm exec vp test <パス>`
- check: リポジトリルートで `pnpm exec vp check <paths...>`
- deploy: `bash scripts/build-all.sh` の完了後、`packages/router` で `pnpm run deploy`

```bash
# 依存関係
pnpm install

# 開発(各アプリごと)
cd apps/<tool-name> && vp dev

# テスト
vp test                     # ユニットテスト
pnpm test:e2e               # E2Eテスト

# lint / format
vp check                    # Oxlint + Oxfmt check
vp check --fix              # Oxlint + Oxfmt auto-fix

# 全アプリビルド → router/public/ にまとめる
bash scripts/build-all.sh

# router デプロイ(全ツール公開)
cd packages/router && pnpm run deploy

# Storybook
pnpm storybook

# アプリ管理
node scripts/create-app.js       # 新規アプリ作成
node scripts/delete-app.js       # アプリ削除
pnpm run scripts/generate-docs.ts # ドキュメント一括生成
```

## Architecture

```
elchika-tools/
  apps/                  # 各ツール(独立SPA) - 333個
  packages/
    router/              # Cloudflare Workers ルーター + Static Assets
      src/               # ルーティングロジック(Hono)
        config/apps.ts   # 全アプリのルーティング定義
      public/            # ビルド済み静的ファイル(build-all.sh が生成)
  scripts/               # 管理スクリプト(create-app, delete-app, build-all, generate-docs)
  .docs/                 # デザインシステム・テンプレートガイド
  e2e/                   # Playwright E2Eテスト
  .storybook/            # Storybook設定
```

### デプロイアーキテクチャ

```
User → tools.elchika.app/<app>/
  → Cloudflare Workers (packages/router)
    → Static Assets (packages/router/public/<app>/)
```

- 全アプリを1つの Workers プロジェクトに統合
- `scripts/build-all.sh` で全アプリビルド → `packages/router/public/` にまとめる
- `packages/router` を1回デプロイすれば全ツール公開
- 個別の Cloudflare Pages プロジェクトは不要

### 各アプリの構成

```
apps/<tool-name>/
  src/
    App.tsx            # メインコンポーネント(ロジック+UI)
    main.tsx           # エントリポイント
    components/ui/     # elchika-inc/ui（Base UI）由来のコンポーネント
    utils/             # コアロジック(純粋関数)
      __tests__/       # ユニットテスト
    hooks/             # カスタムフック(あれば)
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  wrangler.toml        # レガシー(個別デプロイ用、現在は build-all 方式)
```

## 重要な設計原則（What NOT to Do）

- **`apps/*/vite.config.ts` の `base` は必ず `'./'`。`'/'` にすると全アプリが白画面になる**
  (HTML は 200 で返るが参照先の JS/CSS が 404 になるため、ステータスコードでは検知できない)。
  2026-03 以降くり返し再発している。再発構造・診断手順は `.docs/ASSET_PATH_INCIDENT.md` が正本
- **修正は必ず `apps/*/vite.config.ts` 側に入れる**。`packages/router/public/` の生成物を
  書き換えて直しても、次の `build-all.sh` で巻き戻る(実際に再発した)
- ほぼ全アプリが完全クライアントサイド (例外: image-ocr は tesseract.js がCDNから言語データをダウンロード、dns-lookup は DoH API を使用)
- `url-encoder` が最初期のテンプレート。多くのアプリがこれをベースにコピーされている
- 一部アプリの `index.html` に元テンプレートの title/description が残っている場合がある
- 各アプリの `wrangler.toml` はレガシー(個別Pages デプロイ時代の名残)。現在は build-all 方式を使用
- `packages/router/public/` はビルド生成物だが **git 管理が必須**。
  `.github/workflows/deploy.yml` は `wrangler deploy` のみでビルドを行わないため、
  **コミットされている `public/` の中身がそのまま本番になる**
- 上記は `node scripts/check-asset-paths.js` で機械的に検査できる
  (build-all.sh の先頭と deploy.yml のデプロイ前に組み込み済み。違反があれば止まる)
- **フォントは共有配信**。`scripts/build-fonts.js` が `packages/router/public/fonts/` に1セット生成し、
  各アプリの `index.html` は `<link rel="stylesheet" href="/fonts/fonts.css">` で参照する
- **Vite の `base: './'` は HTML 内の絶対パスも相対化する**ため、`build-all.sh` から呼ばれる
  `scripts/fix-font-link.js` が build 後に `/fonts/fonts.css` へ書き戻す。
  共有資産を追加するときは同じ書換えが必要か確認する
- **dark モードは `data-theme="dark"` 駆動**。`.dark` クラスだけでは切り替わらない

### 検証コマンドの落とし穴

いずれも SP1（`docs/superpowers/specs/2026-07-29-design-standards-adoption-design.md`）で実測した。

- **テストはリポジトリルートから `pnpm exec vp test <パス>` で実行する。**
  `pnpm --filter <app> test` はアプリ cwd の `vite.config.ts` を使うため、root `vite.config.ts` の
  test 設定(`environment: "happy-dom"` / `setupFiles`)を失い、全 DOM テストが
  `document is not defined` で落ちる。実測: filter 実行は 44 failed / 11 passed、
  root 実行は同一コードで 55 tests すべて PASS。**build と dev の filter 実行は正しい**
  (アプリ自身の設定を使うのが正しいため)。使わないのは test だけ
- **リポジトリ全体の `pnpm check` は通らない。** 2026-07 時点で 9074 ファイルに既存の
  formatting issue があり exit 1 になる。変更したファイルを明示列挙した
  `pnpm exec vp check <paths...>` を使う(`vp check` に exclude オプションはない)。
  整形せず lint/type だけ見たいときは `--no-fmt`
- **`vp check` に Markdown だけを渡すと必ず exit 1 になる。** `--no-fmt` は整形を止めるだけで、
  Markdown を lint 対象にはしない。対象拡張子が 1 つも無いため
  `error: Linting could not start / No files found to lint` で落ちる(SP2 で実測。
  同じ引数に JS を 1 つ加えると exit 0 になることで裏取り済み)。
  **これはドキュメントの不備ではないので、この exit 1 を直しに行かないこと。**
  Markdown だけの変更は `git diff` の目視で確認する
- **整形してはいけないファイルが 3 種類ある。** どれも「diff や字面を読むこと自体が検証手段」で、
  整形するとその検証が壊れる
  - `packages/design-tokens-elchika/` 配下 — upstream との drift 検知が壊れる
  - `*.md` — 変更箇所のレビューが不能になる
  - `apps/*/vite.config.ts` — gate は PR #849 でクォート非依存になったため整形しても落ちないが、
    346 ファイルに無関係な整形差分が出て変更箇所のレビューが不能になる
- **テストからリポジトリ内のファイルを読むとき `import.meta.url` は使えない。**
  Vite+ の transform 下で `file:` スキームにならず `fileURLToPath` が TypeError になる。
  `process.cwd()` 基準の `path.resolve` を使い、見つからないときに実行場所を示すエラーを投げる
- **新規 workspace パッケージの `tsconfig.json` は `tsconfig.base.json` を extends する。**
  root の `tsconfig.json` は `types: ["@cloudflare/workers-types"]` のみで Node の型を持たない。
  なお base は `noUncheckedIndexedAccess` / `exactOptionalPropertyTypes` が有効で厳格
- **`scripts/design-audit.js` は `.docs/design-audit-result.json` を書き換える。**
  `--app` 指定で実行すると全アプリ分の結果が 1 アプリ分に置き換わるため、
  実行後に `git checkout -- .docs/design-audit-result.json` で戻し、コミットに含めない
- **検証コマンドを `;` や `&&` で連結しない。** 末尾のコマンドの exit code で上書きされ、
  個々の失敗が見えなくなる(SP1 で実際に、末尾の `printf` が `grep` の exit 1 を 0 に変え、
  無出力を「1 件ヒット」と誤記した)。別実行の `echo $?` もシェルが独立しているため無効
- **ローカルサーバーのポートを固定値で前提にしない。** Vite は使用中なら自動退避する
  (SP1 では 5173 が外部プロセスに占有され 5174 になった)。起動ログが示すポートを読む

## エージェント連携

### dev 起動コマンドとアクセス URL

各アプリは次の手順で起動する。

```bash
cd apps/<tool-name>
pnpm run dev
```

アクセス URL は `http://localhost:<起動ログに表示されたport>/`。各 `vite.config.ts` の
`server.port` は初期候補であり、346 config に対して一意な値は293個、重複値は51個
（重複値を使うアプリは104個）ある。`apps/` と `templates/react-spa/` の config に
`strictPort` 指定はなく、使用中の port は既定動作で空き port へ退避するため、起動ログの URL を正本とする。

### dev-data-safety

- `dev-data-safety: local`（自動起動可）
- アプリとルーターに D1 / KV / R2 / Durable Objects 等の共有データストア接続はなく、開発時の
  SPA はローカルブラウザ上で動作する。image-ocr のCDN言語データ取得と dns-lookup の DoH API
  呼び出しは外部通信だが、共有データストアへの書き込みではない。

### routes / 主要ページ一覧

- ルーティング定義の正本: `packages/router/src/config/apps.ts`
- 本番の各アプリ入口: `https://tools.elchika.app/<app>/`

## コーディング規約

- パスエイリアス: `@/` → `src/`, `@components/`, `@utils/`, `@types/`, `@config/`, `@hooks/`, `@services/`
- ボタン要素には必ず `type="button"` を付与
- 非同期クリップボード操作は try/catch で囲む
- UI コンポーネントは elchika-inc/ui の registry から取り込んだ Base UI コンポーネントを使用
- コアロジックは `src/utils/` に純粋関数として分離
- テストは `src/utils/__tests__/` に配置
- Oxfmt: indent 2 spaces, single quotes, semicolons, line width 100
- innerHTML を動的に設定する場合は必ず入力をエスケープしてから渡す(XSS対策)

## 新規アプリ作成

1. `node scripts/create-app.js` または既存アプリをコピー
2. `package.json` の name を更新
3. `vite.config.ts` の port を一意に設定
4. `index.html` の title, description を更新
5. `src/utils/` にコアロジック、`src/App.tsx` にUI実装
6. テスト追加: `src/utils/__tests__/`
7. `packages/router/src/config/apps.ts` にルーティング設定追加

参考: `.docs/APP_TEMPLATE_GUIDE.md`, `.docs/DESIGN_SYSTEM.md`

## CI

| workflow | trigger | 内容 |
|---|---|---|
| `.github/workflows/ci.yml` | `pull_request` | 型検査 → ユニットテスト → 変更アプリのビルド → アセットパス検査。check 名は **`ci`** |
| `.github/workflows/deploy.yml` | `push: [main]` | 型検査 → ユニットテスト → アセットパス検査 → Workers deploy |

- **required status check は `ci`**（`ci.yml` の job id。job に `name:` を置いていないので出所は1箇所）。ruleset `main`（id=20942268）に `strict=true` で設定済み。現構成は job 1本で matrix を持たないため、matrix 展開名のように名前が消えることがない。**job を分割・改名するときは、集約 job を立てて required の対象を `ci` という固定名に保つこと**（required が存在しない名前を指すと、以後すべての PR が「Expected — waiting」で永久に BLOCKED になる）。
- **lint / fmt は CI で実行しない。** ローカルの `vp check` / `vp fmt` が一次責任者（standards `DOCS_OPS.md` §6）。
- **E2E は Actions で実行しない（MUST NOT）。** `vp test` が読む root `vite.config.ts` の `test.exclude` に `**/e2e/**` があり、Playwright の spec は収集対象に入らない。E2E はローカルの `pnpm test:e2e` で担保する。
- 型検査の対象範囲・ユニットテストの隔離リスト・ビルド対象の絞り込みはいずれも緩和であり、**内容・実測値・解除条件は `.docs/risk-registry.md` が正本**（RISK-001 / RISK-002 / RISK-003 / RISK-006 ほか）。この節と workflow のコメントは要約とポインタで、食い違ったときは台帳が勝つ。**隔離リストへの追加は同じ PR で RISK-002 を更新する。**
- `ci.yml` の job は secrets を1つも参照せず、`permissions: contents: read` のみ・`environment` 指定なし・GitHub-hosted runner で動く。`DOCS_OPS.md` §6 の信頼境界の**内側**に留まっており、「信頼済みと見なせる条件」による緩和を採っていない（したがって §6 の緩和記録の対象外）。**secrets の参照・`permissions` の write 化・`environment` の追加・self-hosted runner への変更は、いずれもこの前提を壊す**（その時点で §6 の緩和記録が MUST になる）。

## デプロイ

全アプリを1つの Cloudflare Workers プロジェクトとしてデプロイ。

```bash
bash scripts/build-all.sh          # 全アプリビルド → public/ へ
cd packages/router && pnpm run deploy  # Workers デプロイ
```

`packages/router` が `tools.elchika.app/<tool-name>` へのルーティングと静的ファイル配信を担当。
ルーティング設定は `packages/router/src/config/apps.ts` で一元管理。

### デプロイ後の確認

**HTML の HTTP 200 やバンドルハッシュの一致だけを根拠にしない。**
ハッシュが一致していても参照パスが壊れていれば白画面になる(過去に発生)。
HTML が参照している URL を実際に GET し、200 かつ content-type が JS/CSS であることまで確認する。

```bash
curl -s https://tools.elchika.app/<app>/ | grep -o -E '(src|href)="[^"]*"'   # 参照先を取り出し
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' <上で得た URL>       # 実際に取得する
```

content-type まで見るのは、存在しないパスに HTML が 200 で返るケースを弾くため。
詳細は `.docs/ASSET_PATH_INCIDENT.md`。

**全アプリをまとめて検査するには `node scripts/health-check-runtime.js` を使う。**
上記の 2 段階(HTML 取得 → 参照先を実取得)を全アプリに対して行う。
346 アプリで約 30 秒、結果は `.docs/health-check-result.json` に残る。
手で curl するより網羅的で、サンプリングの取りこぼしがない。

**デプロイ直後は Cloudflare のエッジ伝播待ちで参照先が一時的に 404 になる。**
これは白画面事故とまったく同じ症状のため、1 回の 404 で「壊れた」と判定してはならない。
時間をおいて再取得し、解消するかどうかで切り分ける
(2026-07-31 の SP2 デプロイでは、直後に 404 だった複数アプリが再取得ですべて 200 になり、
最終的に 346 / 346 正常だった)。

## Design Rules (AI向けデザイン品質)

UIコードを書く・レビューするときは必ず `.docs/DESIGN.md` を先に読むこと。

- **新規アプリ生成時**: DS-001〜DS-010 をすべて確認してからコミットする
- **既存アプリ監査時**: `node scripts/design-audit.js --app=<name>` を実行し、違反を修正する
- **全アプリ一括監査**: `node scripts/design-audit.js` → `.docs/design-audit-result.json` を参照
