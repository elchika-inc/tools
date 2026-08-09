# elchika-ui 展開 PR3（旧構成の一掃）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 最後に残った `home` アプリを elchika-inc/ui へ移行し、新規アプリのテンプレートを現行構成に更新したうえで、利用者がゼロになる旧パッケージ2つを削除して Radix と旧トークンをリポジトリから一掃する。

**Architecture:** home は button 1つだけの構成なので PR2 と同じ codemod で移行できる。移行後に旧 `@tools/design-tokens` の利用者がゼロになり、`@tools/ui`（Radix 依存・利用者ゼロ）と併せて削除できる。テンプレートは現行アプリ（url-encoder）の構成に合わせる。

**Tech Stack:** Base UI (`@base-ui/react`) / `@tools/design-tokens-elchika` / Vite+ (`vp`) / pnpm workspaces

**Spec:** `docs/superpowers/specs/2026-08-09-elchika-ui-rollout-design.md`（PR1・PR2 と同じ設計。本 PR はその残件処理）

**前提:** PR1（#852）と PR2（#853）はマージ・本番反映済み。345アプリが elchika-ui へ移行し、health-check 346/346 正常。

## ユーザー決定（2026-08-09）

旧パッケージ（`@tools/ui` と `@tools/design-tokens`）を**削除する**。

## 実測で確定した事実（2026-08-09。再調査不要）

| 対象 | 実測結果 |
|---|---|
| `@tools/design-tokens` の利用者 | **`home` の1アプリのみ**（`apps/home/src/index.css` が `@import`） |
| `@tools/ui` の利用者 | **ゼロ**。参照は `packages/ui/src/primitives/*.stories.tsx` 5件の自己参照と自身の package.json のみ |
| `@tools/ui` の依存 | `@radix-ui/react-{label,select,slot,switch,slider,toast}`（旧構成） |
| `templates/react-spa/package.json` | `@tools/design-tokens` と `@tools/ui` に依存（**新規アプリが旧構成になる**） |
| `home` の構成 | `src/components/ui/button.tsx` のみ。`@radix-ui/react-slot` を使用。`src/index.css` は `@import "@tools/design-tokens";` の1行 |
| `home` の Radix 依存 | package.json に宣言があり整合している（壊れてはいない） |

## Global Constraints

- **指示（この計画）と実態が矛盾したら、勝手に直さず `orca orchestration ask` で司令塔へ報告して指示を待つ**
- 裁量範囲: 公開シグネチャと完了条件は変えない。計画に無い変更はすべて `worker_done` と PR 本文で申告する
- レビューサイクルは worker 側で完結する（確信度80%以上の指摘が0になるまで修正→再レビュー、上限3ラウンド）
- `apps/*/vite.config.ts` は触らない・整形しない（346/346 が `base: './'` の状態を維持）
- `*.md` と `tokens.css` 系ファイルを Oxfmt で整形しない
- **検証の前に必ずリポジトリルートで `pnpm install` を実行する**
- テストはリポジトリルートから `pnpm exec vp test <パス>`
- lint/format は変更ファイルを明示列挙した `pnpm exec vp check <paths...>`
- 検証コマンドを `;` / `&&` / pipe で連結しない。シェルから直接 `rm -rf` を実行しない（`git rm -r` を使う）
- コミットは `git add <明示パス>` で行う
- **`home` 以外の345アプリには触れない**（PR2 で移行済み）

## ベースライン（司令塔が実測済み。これを判定基準にする）

```
pnpm install 実行後の pnpm exec vp test:
  Test Files  12 failed | 696 passed
  Tests  7 failed | 6897 passed | 5 skipped   → exit 1
```

既存失敗（移行と無関係。**直さない**）:
`bcrypt-hash` / `file-rename-batch`(2) / `geo-distance` / `hash-crc32` / `hash-md5` /
`k8s-yaml-generator` / `markdown-to-slides` / `nato-phonetic` / `sql-playground` /
`zip-creator` / `packages/mcp-server` / `packages/router`

その他のベースライン: `build-all.sh` は 346/346 成功 / `check-asset-paths.js` exit 0 /
`health-check-runtime.js` 346/346 / `design-audit.js` 758件 / `public/` 144MB

---

### Task 1: home アプリを elchika-inc/ui へ移行

**Files:**
- Modify: `apps/home/src/components/ui/button.tsx`（elchika 版へ置換）
- Modify: `apps/home/src/index.css`（トークン切替）
- Modify: `apps/home/index.html`（フォント link 追加）
- Modify: `apps/home/package.json`（依存差し替え）
- Create: `apps/home/public/fonts`（シンボリックリンク）

**Interfaces:**
- Consumes: PR2 で作成済みの `scripts/codemods/migrate-to-elchika-ui.js`
- Produces: home が他345アプリと同じ構成になる。`@tools/design-tokens` の利用者がゼロになる

- [ ] **Step 1: codemod が home を扱えるか確認する**

PR2 の codemod は `home` を対象外にしている。除外指定の実装を確認する:

```bash
grep -n "home" scripts/codemods/migrate-to-elchika-ui.js
```

除外リストから `home` を外して実行できるなら、それが最も安全（345アプリで実績のある処理を使う）。
除外が引数側で制御できるなら引数で指定する。**除外ロジックの実装形態に応じて、
最小の変更で home を対象に含めること**。判断に迷ったら報告する。

- [ ] **Step 2: home へ codemod を適用**

```bash
node scripts/codemods/migrate-to-elchika-ui.js home
```

出力を記録する。「要個別処理」と出た場合はその内容を確認する。

```bash
pnpm install
```

- [ ] **Step 3: 移行結果を検証**

各コマンドを単独実行する:

```bash
grep -rn "@radix-ui" apps/home/src
```
Expected: 0件（exit 1）

```bash
cat apps/home/src/index.css
```
Expected: `@import "@tools/design-tokens-elchika";` の1行のみ

```bash
grep -c "fonts/fonts.css" apps/home/index.html
```
Expected: 1

```bash
grep -n "radix\|design-tokens" apps/home/package.json
```
Expected: `@tools/design-tokens-elchika` のみがヒット（`@radix-ui/*` と旧 `@tools/design-tokens` が消えている）

- [ ] **Step 4: ビルドとテスト**

```bash
cd apps/home
pnpm run build
```
Expected: exit 0

```bash
node -e "const fs=require('fs');const d='dist/assets';const f=fs.readdirSync(d);const s=f.reduce((a,x)=>a+fs.statSync(d+'/'+x).size,0);console.log(f.length+' ファイル / '+(s/1024/1024).toFixed(2)+' MB')"
```
Expected: 1MB 未満

```bash
grep -r "fonts.googleapis" dist
```
Expected: 0件（exit 1）

リポジトリルートで:

```bash
pnpm exec vp test apps/home
```
Expected: exit 0（テストが存在しない場合はその旨を報告）

- [ ] **Step 5: home の目視動作確認**

```bash
cd apps/home
pnpm run dev
```

**起動ログが示すポートの実値を読む**。ブラウザで開き、次を**操作して反応するところまで**確認する:

- ツール一覧が表示される
- 検索ボックスに文字を入れると絞り込まれる
- カテゴリフィルタをクリックすると絞り込まれる
- ツールカードのリンクが正しい URL を指している
- `document.fonts.check("16px 'IBM Plex Sans JP'", "あ")` と
  `document.fonts.check("16px 'IBM Plex Sans JP'", "A")` が**ともに true**
  （テキスト引数なしの check は unicode-range 分割フォントで偽陰性を出すため使わない）
- `getComputedStyle(document.body).fontFamily` に `IBM Plex` が含まれる
- `document.documentElement.dataset.theme = 'dark'` で dark 表示になり、`'light'` で戻る
- console に error / warn が出ていない（favicon の 404 は既存で対象外）

確認後、dev サーバーを停止する。

- [ ] **Step 6: lint と commit**

```bash
pnpm exec vp check <変更した .tsx/.ts/.json ファイルを明示列挙>
```

```bash
git add apps/home package.json pnpm-lock.yaml .gitignore scripts
git commit -m "feat(home): home アプリを elchika-inc/ui へ移行"
```

---

### Task 2: 新規アプリテンプレートを現行構成へ更新

**Files:**
- Modify: `templates/react-spa/package.json`
- Modify: `templates/react-spa/index.html`
- Modify: `templates/react-spa/src/index.css`（存在すれば）
- Create/Modify: `templates/react-spa/src/components/ui/`（現行コンポーネント）

**Interfaces:**
- Produces: `node scripts/create-app.js` が生成する新規アプリが elchika-ui 構成になる

- [ ] **Step 1: テンプレートと現行アプリの差分を把握する**

```bash
ls -R templates/react-spa
```

```bash
cat templates/react-spa/package.json
```

現行の正しい構成は `apps/url-encoder` を正本とする:

```bash
cat apps/url-encoder/package.json
```

```bash
cat apps/url-encoder/src/index.css
```

```bash
grep -n "fonts" apps/url-encoder/index.html
```

- [ ] **Step 2: package.json を更新**

`templates/react-spa/package.json` の dependencies から
`@tools/design-tokens` と `@tools/ui` を削除し、`apps/url-encoder/package.json` に合わせて
`@base-ui/react` / `@tools/design-tokens-elchika` / `class-variance-authority` / `clsx` /
`tailwind-merge` / `tw-animate-css` を入れる。**バージョンは url-encoder の実値を読み取って使う**
（この計画にバージョンを書かない — ドリフトを防ぐため）。

- [ ] **Step 3: index.css と index.html を更新**

`templates/react-spa/src/index.css` を `@import "@tools/design-tokens-elchika";` の1行にする
（ファイルが無ければ作成する）。

`templates/react-spa/index.html` の `</head>` 直前に次を追加する（既にあれば何もしない）:

```html
    <link rel="stylesheet" href="/fonts/fonts.css" />
```

- [ ] **Step 4: UI コンポーネントをテンプレートへ入れる**

テンプレートに `src/components/ui/` が無い場合、`apps/url-encoder/src/components/ui/` から
`button.tsx` / `card.tsx` / `input.tsx` / `label.tsx` をコピーする
（新規アプリの出発点として最小セット。select と toast は必要になったとき
`npx shadcn@latest add @elchika/<name>` で取り込む方針とし、README かテンプレート内コメントに記す）。

`src/lib/utils.ts`（`cn` ヘルパー）も無ければコピーする。

- [ ] **Step 5: テンプレートから実際にアプリを生成して検証**

```bash
node scripts/create-app.js
```

対話式の場合は一時的なアプリ名（例 `tmp-template-probe`）で生成する。
非対話の引数指定が可能ならそれを使う。**生成方法が不明なら止めて報告する**。

生成されたアプリで:

```bash
pnpm install
```

```bash
cd apps/tmp-template-probe
pnpm run build
```
Expected: exit 0

```bash
grep -rn "@radix-ui" src
```
Expected: 0件（exit 1）

```bash
grep -c "fonts/fonts.css" ../../apps/tmp-template-probe/index.html
```
Expected: 1

検証後、**生成した一時アプリを削除する**:

```bash
node scripts/delete-app.js
```

（対話式で `tmp-template-probe` を指定する。削除できない場合は `git rm -r` と
`packages/router/src/config/apps.ts` の登録解除で対応し、その旨を報告する）

削除後に `git status --porcelain` で一時アプリの痕跡が残っていないことを確認する。

- [ ] **Step 6: commit**

```bash
pnpm exec vp check <変更した .json/.ts/.tsx ファイルを明示列挙>
```

```bash
git add templates package.json pnpm-lock.yaml
git commit -m "feat(templates): 新規アプリテンプレートを elchika-inc/ui 構成へ更新"
```

---

### Task 3: 旧パッケージ2つを削除

**Files:**
- Delete: `packages/ui/`
- Delete: `packages/design-tokens/`

**Interfaces:**
- Consumes: Task 1（home 移行）と Task 2（テンプレート更新）で両パッケージの利用者がゼロになっていること

- [ ] **Step 1: 利用者がゼロであることを削除前に実測する**

**この検査に1件でもヒットしたら削除せず報告すること。**

```bash
grep -rn "@tools/design-tokens\"" apps packages templates --include="*.json"
```
Expected: 0件（exit 1）。`@tools/design-tokens-elchika` は別名なので `"` 付きで厳密に検索する

```bash
grep -rn "@tools/ui" apps packages templates --include="*.json" --include="*.ts" --include="*.tsx" --include="*.css"
```
Expected: `packages/ui/` 自身の中のみ（自己参照）。それ以外にヒットしたら報告する

```bash
grep -rn "@tools/design-tokens\b" apps templates --include="*.css"
```
Expected: 0件（exit 1）

- [ ] **Step 2: 削除する**

```bash
git rm -r -q packages/ui
```

```bash
git rm -r -q packages/design-tokens
```

```bash
pnpm install
```

- [ ] **Step 3: 全体が壊れていないことを確認**

リポジトリルートで各コマンドを単独実行する:

```bash
pnpm exec vp test
```
Expected: 失敗が**ベースライン（12 files / 7 tests）と同一以下**。
新規失敗が1件でもあれば削除の影響なので報告する

```bash
bash scripts/build-all.sh
```
Expected: exit 0（346アプリすべてビルド成功）

```bash
node scripts/check-asset-paths.js
```
Expected: exit 0

- [ ] **Step 4: 削除の痕跡を確認**

```bash
grep -rn "design-tokens\b" --include="*.md" --include="*.json" --include="*.js" --include="*.ts" . --exclude-dir=node_modules --exclude-dir=.git
```

ヒットしたもののうち `design-tokens-elchika` 以外への参照（設定ファイル・スクリプト・
ドキュメント）を洗い出し、**残っている参照を一覧にして報告する**。
Task 4 のルート CLAUDE.md 更新でカバーできるものはそちらで扱い、
スクリプトや設定に残るものはこの Task で修正する。

- [ ] **Step 5: commit**

```bash
git add packages pnpm-lock.yaml
git commit -m "chore: 利用者ゼロの旧パッケージ(@tools/ui, @tools/design-tokens)を削除"
```

---

### Task 4: リポジトリルートの CLAUDE.md を実態へ更新

**Files:**
- Modify: `CLAUDE.md`

Action Queue の `next-session-root-claude-md-stale.md` に実測済みの陳腐化箇所がある。
**そのファイルを読んでから作業すること**:

```bash
cat .docs/actions/next-session-root-claude-md-stale.md
```

- [ ] **Step 1: 陳腐化箇所を修正**

上記 action に列挙された5箇所（41 / 56 / 57-58 / 104 / 198 行目付近）を実態へ更新する。
行番号は変動しうるので**内容で特定する**。

- [ ] **Step 2: 移行で得た知見を追記**

action の「追記が必要な内容」の4項目を Gotchas 節へ追加する:

- フォントは共有配信（`packages/router/public/fonts/` に1セット、各アプリの `index.html` が
  `<link rel="stylesheet" href="/fonts/fonts.css">` で参照、`scripts/build-fonts.js` が生成）
- **`base: './'` は HTML 内の絶対パスも相対化する**ため `scripts/fix-font-link.js` が
  build 後に書き戻す（`build-all.sh` から呼ばれる）。共有資産を追加する際の再発点
- **dark モードは `data-theme="dark"` 駆動**（elchika-ui 仕様）。`.dark` クラス単独では切り替わらない
- 整形禁止ファイルに `packages/design-tokens-elchika/` 配下を追加
  （upstream との drift 検知が壊れるため）

- [ ] **Step 3: 記述と実態の一致を機械検査**

```bash
grep -n "shadcn/ui\|Radix\|@tools/design-tokens\b" CLAUDE.md
```
Expected: ヒットは「旧構成からの移行を説明する文」のみ。現行構成の説明として
残っていたら修正漏れ。**禁止語の単純な0件チェックにしない**——
移行の経緯を書いた文にも旧名称は出るため、出現位置を見て判断する

- [ ] **Step 4: commit**

`*.md` は整形禁止のため `vp check` に渡さない。`git diff` の目視で確認する。

```bash
git add CLAUDE.md
git commit -m "docs: ルート CLAUDE.md を elchika-ui 移行後の実態へ更新"
```

---

### Task 5: 最終検証と PR 作成

- [ ] **Step 1: 全項目を実測**

各コマンドを単独実行し、結果を記録する:

```bash
pnpm install
```

```bash
pnpm exec vp test
```

```bash
bash scripts/build-all.sh
```

```bash
node scripts/check-asset-paths.js
```

```bash
node scripts/design-audit.js
```

```bash
git checkout -- .docs/design-audit-result.json
```

```bash
du -sh packages/router/public
```

```bash
grep -rn "@radix-ui" apps/*/src
```

- [ ] **Step 2: 生成物を反映**

`build-all.sh` が `packages/router/public/` を更新しているはずなので、差分を確認してコミットする:

```bash
git status --porcelain packages/router/public
```

```bash
git add packages/router/public
git commit -m "build(router): home 移行と旧パッケージ削除を反映して再生成"
```

- [ ] **Step 3: push と PR 作成**

```bash
git push -u origin naoto24kawa/elchika-ui-cleanup
```

```bash
gh pr create --repo elchika-inc/tools --title "chore: 旧構成の一掃（home 移行・テンプレート更新・旧パッケージ削除）" --body "<下記を記載>"
```

PR 本文に含める: この計画へのパス / rubric 各項目の実測値 / 削除したパッケージと
削除前の利用者ゼロ検査の結果 / Task 3 Step 4 で見つかった残存参照とその扱い /
レビュー記録 / 計画から逸れた変更の申告 / 実装担当: Codex /
「マージ・デプロイは司令塔が human 承認後に実施」の明記。

**worker はここで停止し、司令塔の完了ゲートを待つ。**

## PR3 の完了条件（rubric）

1. `pnpm exec vp test` の失敗が**ベースライン（12 files / 7 tests）と同一以下**。新規失敗ゼロ
2. `bash scripts/build-all.sh` が exit 0（346アプリすべて成功）
3. `node scripts/check-asset-paths.js` が exit 0
4. `grep -rn "@radix-ui" apps/*/src` が **0件**（home を含む全アプリ。PR2 では home のみ残っていた）
5. `packages/ui/` と `packages/design-tokens/` が存在しない
6. `templates/react-spa/package.json` に `@tools/design-tokens` と `@tools/ui` が無く、
   `@tools/design-tokens-elchika` と `@base-ui/react` がある
7. テンプレートから生成したアプリが build 成功し、Radix 参照 0件（Task 2 Step 5 で実測）
8. `home` の目視動作確認（検索・カテゴリフィルタが操作して反応する、フォント適用、dark 切替）
9. ルート `CLAUDE.md` に現行構成の説明として `shadcn/ui` / `Radix` / `@tools/design-tokens`（elchika 無し）が残っていない
10. `node scripts/design-audit.js` の違反が **758件から増えていない**
11. `packages/router/public/` が 200MB 未満
