# elchika-inc/ui（ui.elchika.dev）適用 — パイロット url-encoder 設計書

- 日付: 2026-08-09
- ステータス: 承認済み（ユーザー承認: 2026-08-09）
- スコープ: url-encoder 1 アプリのパイロット移行。成功後に残り 345 アプリへ段階展開（展開は別サイクル）

## 背景と決定事項

ui.elchika.dev（elchika-inc/ui）は Base UI + Tailwind CSS v4 の共有 UI で、
shadcn registry 経由でソースを取り込み利用側が所有する（コピー所有モデル）。
standards DESIGN.md §2 は 2026-08-04 に shadcn/ui（Radix）直取り込みを deprecated とし、
elchika-inc/ui を現行の推奨実装と定めた。

ユーザー決定（2026-08-09）:

1. **適用範囲**: パイロット→段階展開（一括移行・新規のみ・トークンのみ、は不採用）
2. **パイロット対象**: url-encoder（最初期テンプレートで多くのアプリのベース。
   使用コンポーネントが button / card / input / label / select / toast と少ない）
3. **トークン配置**: 並行パッケージ方式。`@tools/design-tokens-elchika` を新設し、
   url-encoder の import 1 行だけ切替。現行 `@tools/design-tokens` は無改変
   （346 アプリが使用中のため。中身を差し替えると全アプリが同時にリスタイルされ、
   パイロット方針と矛盾する）
4. **フォント**: elchika-ui 配布の Google Fonts CDN `@import url(...)` 2 行を
   fontsource セルフホスト import に差し替える。「ほぼ全アプリが完全クライアントサイド」
   方針を維持するため。ファミリ（IBM Plex Sans JP / Sans / Mono）・ウェイト
   （400/500/600）は配布どおり

記録（standards との関係）: standards DESIGN.md §2 の既定は
「既存プロジェクトへは遡及しない — 触った箇所だけ elchika-inc/ui へ寄せる」。
本計画の最終目標（全アプリ展開）はこの既定を**意図的に超えるユーザー決定**である。

## 実測済みの前提（2026-08-09 実測）

- elchika-ui の tokens 体系は現行 `@tools/design-tokens` とほぼ別物（共通変数 4 個のみ）。
  ただし alias 層（`elchika-ui/tokens.css`）が shadcn 語彙（`--background` 等）を
  `@theme inline` でブリッジするため、既存の `bg-background` 系 Tailwind クラスは互換
- registry の component JSON（例 `https://ui.elchika.dev/r/button.json`）は
  component 本体に加え `global.css` / `design-system/tokens.css` /
  `design-system/brands.css` / `LICENSE` / `THIRD_PARTY_LICENSES` を配布する
- 依存: `@base-ui/react` / `class-variance-authority` / `shadcn` / `tw-animate-css`
- `design-system/tokens.css` の 9-10 行目に Google Fonts CDN の `@import url(...)` が 2 行ある
- brands.css は `[data-brand="indigo|violet|purple|magenta|rose"]` のアクセント切替（1.4KB）

## 新パッケージ `@tools/design-tokens-elchika`

```
packages/design-tokens-elchika/
  tokens.css                      # alias 層（elchika-ui/tokens.css 配布物）
  design-system/tokens.css        # design system 層 v1.8（フォント import のみ局所編集）
  design-system/brands.css        # [data-brand] ノブ
  LICENSE
  THIRD_PARTY_LICENSES            # standards MUST: コピー所有物として保持
  package.json                    # exports "." → tokens.css
  src/__tests__/upstream-drift.test.ts  # 後述
```

- 配布物への局所編集は**フォント import 2 行の置換のみ**（CDN → `@fontsource/ibm-plex-sans-jp`
  等）。色トークンは standards DESIGN.md §3 MUST（design system 層の `--color-*` を
  利用側で再定義しない）に従い無改変
- package.json の依存: `@fontsource/ibm-plex-sans-jp` / `@fontsource/ibm-plex-sans` /
  `@fontsource/ibm-plex-mono` / `shadcn` / `tailwindcss` / `tw-animate-css`
  （正確なパッケージ名・ウェイト指定の import 形は worktree で実測して確定する）
- tsconfig.json は `tsconfig.base.json` を extends する（root tsconfig は Node 型を持たない）
- **WCAG 検証の扱い**: 現行 `@tools/design-tokens` の `tokens.test.ts`（WCAG 実計算）は
  現行パッケージに残す。新パッケージの色検証は upstream CI
  （elchika-ui の token build gate + consumer contrast sensor）に委ねる。
  代わりに `upstream-drift.test.ts` で「ローカル 3 ファイルと
  https://ui.elchika.dev/r/button.json 配布物との差分がフォント import 行のみ」を検証し、
  無自覚なドリフトを機械検知する（ネットワーク不可の環境ではスキップし、その旨を出力する）。
  テストからのファイル読みは `import.meta.url` でなく `process.cwd()` 基準の
  `path.resolve` を使う（リポ CLAUDE.md の既知の落とし穴）

## url-encoder の変更

- `src/index.css` → `@import "@tools/design-tokens-elchika";` の 1 行に切替
- `components.json` を新設し `@elchika` 名前空間を登録
  （`"registries": {"@elchika": "https://ui.elchika.dev/r/{name}.json"}`）
- `npx shadcn@latest add` で button / card / input / label / select / toast 系を
  `src/components/ui/` に取り込む（コピー所有）。
  **shadcn add がトークン CSS をアプリ内（例 `src/styles/`）にも落とす場合は削除し、
  共有パッケージ側へ一本化する**。add のたびに index.css へ alias block が再追記される
  ため、add 実行ごとに削除する（ui.elchika.dev トップページ「トークン置換の注意」が正本）
- 依存変更: `@base-ui/react` / `shadcn` / `tw-animate-css` /
  `@tools/design-tokens-elchika` を追加、`@radix-ui/*` 4 パッケージと
  `@tools/design-tokens` を削除
- **toast は API 非互換前提**: elchika-ui の Toast（または Sonner）に合わせて
  `App.tsx` / `toaster.tsx` / `hooks/`（useToast があれば）を書き換える
- 既存 `src/components/ui/__tests__/` と `*.stories.tsx` は新コンポーネント API へ追随
- `vite.config.ts` は**触らない・整形しない**（`base: './'` 維持）。
  `*.md` / `tokens.css` 系も整形しない（リポ CLAUDE.md「整形してはいけないファイル」）
- ファイル配置の細部（shadcn add が実際に落とすパス・生成物）は spec で決め打ちせず、
  worktree での dry-run で確定する（Measure First）

## 実装体制

- 実装は Orca worktree `elchika-ui-pilot`（ブランチ `naoto24kawa/elchika-ui-pilot`）の
  worker（実装エージェント）へ委任する。委任仕様は delegation-spec 準拠:
  - レビューサイクル（flag 確信度 80% 以上の指摘が 0 になるまで）は worker 側で完結
  - 「指示と実態が矛盾したら止めて報告」条項を含める
  - 裁量範囲: シグネチャ・成功基準は変えない。変更内容は申告する
- 司令塔（main セッション）は完了ゲート（下記 rubric との突合）とマージ・撤収を担う

## 検証 rubric（DoneCriteria）

ベースライン（2026-08-09 置換前に main checkout で実測済み）:

| probe | ベースライン |
|---|---|
| リポ root から `pnpm exec vp test apps/url-encoder` | exit 0、5 files / 55 tests PASS |
| `apps/url-encoder` で `pnpm run build` | exit 0、dist に Geist woff2 同梱、CSS 31.48kB / JS 255.25kB |
| `node scripts/design-audit.js --app=url-encoder` | **exit 1、DS-002 1 件**（"← Tools トップに戻る" バックリンク欠如 — 既存違反であり本移行と無関係） |

完了条件（置換後、すべて満たすこと）:

1. `pnpm exec vp test apps/url-encoder` が exit 0（テストは新 API へ追随済みの状態で全 PASS。
   テスト数は追随に伴い増減してよいが、削除だけで通したものは不可 — 各コンポーネントの
   既存テスト観点を保持する）
2. `pnpm run build`（url-encoder）が exit 0、dist に IBM Plex の woff2 が同梱され
   Google Fonts へのネットワーク参照（`fonts.googleapis.com`）が dist 内に存在しない
   （`grep -r fonts.googleapis dist/` が 0 件。この probe の検出対象はビルド生成物のみで、
   ソースコメント等は対象外）
3. `node scripts/design-audit.js --app=url-encoder` の違反が**ベースラインと同一
   （DS-002 1 件）以下**であること。新規違反が出た場合、audit スクリプトが
   旧トークン語彙前提の可能性をまず疑い、勝手に「直し」に行かずに司令塔へ報告する。
   実行後 `.docs/design-audit-result.json` は `git checkout --` で戻す
4. 新パッケージの `upstream-drift.test.ts` が PASS
5. `vp dev` での目視確認: 変換動作・toast 表示・select 開閉・dark 切替が機能する
   （確認は「表示される」でなく「操作して反応する」まで。使用ポートは起動ログの実値を読む）
6. 現行 `@tools/design-tokens` と他アプリに変更が一切ないこと
   （`git diff --stat` に packages/design-tokens/ と apps/<url-encoder 以外>/ が現れない）

反映（デプロイ）— パイロットの「反映」は本番公開まで含む:

7. CI の Cloudflare トークンが失効中（Action Queue 既知）のため**手動デプロイ**。
   url-encoder のみビルドして `packages/router/public/url-encoder/` を更新・コミットし、
   `packages/router && pnpm run deploy`
8. デプロイ後確認はリポ CLAUDE.md の 2 段階確認: HTML の参照先 URL を実 GET し
   200 + content-type が JS/CSS であること。直後の 404 はエッジ伝播の可能性があるため、
   時間をおいた再取得で切り分ける（1 回の 404 で失敗と判定しない）

## スコープ外（記録のみ）

- 残り 345 アプリへの展開（パイロット完了後に別サイクルで計画する）
- Action Queue の focus-ring 項目（344 アプリ、standards §5 との差異）は
  elchika-ui 移行で解消される見込みが高く、展開サイクルに統合を検討する
- create-app スクリプト・テンプレートの elchika-ui 対応（展開サイクルで実施）
- design-audit（DS-001〜DS-010）の elchika-ui 対応改修（パイロットで問題が観測されたら
  別途判断する）
