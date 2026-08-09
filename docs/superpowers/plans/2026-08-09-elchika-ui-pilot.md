# elchika-inc/ui 適用パイロット（url-encoder）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** url-encoder を shadcn/ui（Radix）+ `@tools/design-tokens` から elchika-inc/ui（Base UI）+ 新設 `@tools/design-tokens-elchika` へ移行し、本番反映可能な状態にする。

**Architecture:** トークンは並行パッケージ方式（新設パッケージに elchika-ui 配布 3 ファイルを置き、url-encoder の import 1 行だけ切替）。コンポーネントは shadcn registry からコピー所有で取り込み、toast のみ API 非互換のため App.tsx 側を書き換える。

**Tech Stack:** React 19 / TypeScript strict / Vite+ (`vp`) / Tailwind CSS v4 / Base UI (`@base-ui/react`) / shadcn CLI / fontsource (IBM Plex) / Vitest

**Spec:** `docs/superpowers/specs/2026-08-09-elchika-ui-pilot-design.md`（承認済み。判断に迷ったら spec が正）

## Global Constraints

- **指示と実態が矛盾したら、勝手に直さず止めて司令塔へ報告する**（例: registry の配布内容が本計画の記載と異なる、テストが計画どおりで通らない等）
- 裁量範囲: 公開シグネチャ・成功基準（spec の rubric）は変えない。計画から逸れた変更はすべて完了報告で申告する
- レビューサイクルは worker 側で完結する（flag 確信度 80% 以上の指摘が 0 になるまで修正→再レビュー）
- 現行 `packages/design-tokens/` と `apps/url-encoder` 以外のアプリには一切触れない
- `apps/url-encoder/vite.config.ts` は触らない・整形しない（`base: './'` 維持）
- `*.md` と `tokens.css` 系ファイルは Oxfmt で整形しない
- lint/format は変更ファイルを明示列挙した `pnpm exec vp check <paths...>` で行う（リポ全体の `pnpm check` は既存 issue で必ず落ちる）
- テストはリポジトリルートから `pnpm exec vp test apps/url-encoder`（`pnpm --filter` の test 実行は DOM テストが全滅する既知の罠）
- 検証コマンドは `;` / `&&` / pipe で連結しない
- コミットは `git add <明示パス>` で行う（`git add -A` 禁止 — 生成物の紛れ込み防止）

---

### Task 1: `@tools/design-tokens-elchika` パッケージ新設

**Files:**
- Create: `packages/design-tokens-elchika/package.json`
- Create: `packages/design-tokens-elchika/tsconfig.json`
- Create: `packages/design-tokens-elchika/tokens.css`（registry 配布物から取得）
- Create: `packages/design-tokens-elchika/design-system/tokens.css`（同上・フォント行のみ編集）
- Create: `packages/design-tokens-elchika/design-system/brands.css`(同上)
- Create: `packages/design-tokens-elchika/LICENSE`／`THIRD_PARTY_LICENSES`(同上)
- Test: `packages/design-tokens-elchika/src/__tests__/upstream-drift.test.ts`

**Interfaces:**
- Produces: パッケージ名 `@tools/design-tokens-elchika`、exports `"."` → `./tokens.css`。利用側は `@import "@tools/design-tokens-elchika";` 1 行で全トークン + Tailwind + フォントが入る

- [ ] **Step 1: package.json と tsconfig.json を作成**

`packages/design-tokens-elchika/package.json`:

```json
{
  "name": "@tools/design-tokens-elchika",
  "version": "0.1.0",
  "private": true,
  "files": [
    "tokens.css",
    "design-system"
  ],
  "type": "module",
  "exports": {
    ".": "./tokens.css"
  },
  "dependencies": {
    "@fontsource/ibm-plex-mono": "^5.3.0",
    "@fontsource/ibm-plex-sans": "^5.3.0",
    "@fontsource/ibm-plex-sans-jp": "^5.3.0",
    "shadcn": "^4.16.0",
    "tailwindcss": "^4.3.3",
    "tw-animate-css": "^1.4.0"
  }
}
```

`packages/design-tokens-elchika/tsconfig.json`（root tsconfig は Node 型を持たないため base を extends）:

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

- [ ] **Step 2: registry 配布物 5 ファイルを取得して配置**

```bash
cd packages/design-tokens-elchika
node --input-type=module -e '
import { writeFileSync, mkdirSync } from "node:fs";
const res = await fetch("https://ui.elchika.dev/r/button.json");
const j = await res.json();
const map = {
  "src/styles/global.css": "tokens.css",
  "src/styles/design-system/tokens.css": "design-system/tokens.css",
  "src/styles/design-system/brands.css": "design-system/brands.css",
  "LICENSE": "LICENSE",
  "THIRD_PARTY_LICENSES": "THIRD_PARTY_LICENSES",
};
mkdirSync("design-system", { recursive: true });
for (const f of j.files) {
  const dest = map[f.path];
  if (dest) writeFileSync(dest, f.content);
}
console.log("done");
'
```

確認: `head -12 design-system/tokens.css` に `@import url("https://fonts.googleapis.com/...")` が 2 行あること。無ければ配布構成が変わっている — **止めて報告**。

- [ ] **Step 3: フォント import を fontsource へ差し替え**

`design-system/tokens.css` の Google Fonts CDN 2 行:

```css
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@400;500;600&display=swap");
```

を次の 9 行に置換（他は 1 文字も変えない。このファイルは整形もしない）:

```css
@import "@fontsource/ibm-plex-sans/400.css";
@import "@fontsource/ibm-plex-sans/500.css";
@import "@fontsource/ibm-plex-sans/600.css";
@import "@fontsource/ibm-plex-sans-jp/400.css";
@import "@fontsource/ibm-plex-sans-jp/500.css";
@import "@fontsource/ibm-plex-sans-jp/600.css";
@import "@fontsource/ibm-plex-mono/400.css";
@import "@fontsource/ibm-plex-mono/500.css";
@import "@fontsource/ibm-plex-mono/600.css";
```

- [ ] **Step 4: upstream-drift テストを書く**

`packages/design-tokens-elchika/src/__tests__/upstream-drift.test.ts`:

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// vp test はリポジトリルートから実行される前提（リポ CLAUDE.md）。
// import.meta.url は Vite+ の transform 下で使えないため process.cwd() 基準。
const PKG = path.resolve(process.cwd(), "packages/design-tokens-elchika");
const REGISTRY_URL = "https://ui.elchika.dev/r/button.json";

// 配布パス → ローカルパス
const FILE_MAP: Record<string, string> = {
  "src/styles/global.css": "tokens.css",
  "src/styles/design-system/tokens.css": "design-system/tokens.css",
  "src/styles/design-system/brands.css": "design-system/brands.css",
};

// 意図的な局所編集(フォント import の CDN → fontsource 置換)だけを比較から除外する
const isFontImport = (line: string): boolean =>
  line.includes("fonts.googleapis.com") || line.includes("@fontsource/");

const normalize = (body: string): string =>
  body
    .split("\n")
    .filter((line) => !isFontImport(line))
    .join("\n");

describe("upstream drift", () => {
  it("ローカル3ファイルは upstream 配布物とフォント import 行以外一致する", async () => {
    let registry: { files: Array<{ path: string; content: string }> };
    try {
      const res = await fetch(REGISTRY_URL);
      registry = (await res.json()) as typeof registry;
    } catch {
      console.warn("SKIP: ui.elchika.dev に到達できないため upstream drift 検査をスキップ");
      return;
    }
    for (const [remotePath, localPath] of Object.entries(FILE_MAP)) {
      const remote = registry.files.find((f) => f.path === remotePath);
      expect(remote, `${remotePath} が配布物に存在すること`).toBeDefined();
      const local = readFileSync(path.resolve(PKG, localPath), "utf8");
      expect(normalize(local), `${localPath} が upstream と乖離`).toBe(
        normalize(remote?.content ?? ""),
      );
    }
  }, 30_000);
});
```

- [ ] **Step 5: install してテスト実行**

```bash
cd <リポジトリルート>
pnpm install
pnpm exec vp test packages/design-tokens-elchika
```

Expected: 1 passed。FAIL したら差分内容を読み、フォント行の除外漏れ（置換内容の誤り）か upstream 側の想定外構成かを切り分ける。後者なら**止めて報告**。

- [ ] **Step 6: lint と commit**

```bash
pnpm exec vp check packages/design-tokens-elchika/src/__tests__/upstream-drift.test.ts
git add packages/design-tokens-elchika pnpm-lock.yaml
git commit -m "feat(design-tokens-elchika): elchika-inc/ui 配布トークンの並行パッケージを新設"
```

（`tokens.css` / `design-system/*.css` は vp check に渡さない — 整形禁止ファイル）

---

### Task 2: url-encoder のトークン切替

**Files:**
- Modify: `apps/url-encoder/src/index.css`（1 行置換）
- Modify: `apps/url-encoder/package.json`（依存差し替え）

**Interfaces:**
- Consumes: Task 1 の `@tools/design-tokens-elchika`
- Produces: url-encoder は elchika トークンで描画される（コンポーネントはまだ Radix 版のまま — alias 層の shadcn 互換で動く）

- [ ] **Step 1: index.css を切替**

`apps/url-encoder/src/index.css` 全体を次の 1 行にする:

```css
@import "@tools/design-tokens-elchika";
```

- [ ] **Step 2: package.json の依存差し替え**

`apps/url-encoder/package.json` の dependencies から `"@tools/design-tokens": "workspace:*"` を削除し、`"@tools/design-tokens-elchika": "workspace:*"` を追加。

```bash
cd <リポジトリルート>
pnpm install
```

- [ ] **Step 3: ビルドしてフォント切替を実測**

```bash
cd apps/url-encoder
pnpm run build
```

Expected: exit 0。続けて 3 点確認（各コマンドは単独実行）:

```bash
ls dist/assets/ | grep -i plex
```
Expected: `ibm-plex-*` の woff2 が並ぶ（Geist が残っていても Task 4 の依存整理後に消えるかを確認対象にする — この時点で Geist woff2 が出ることは失敗ではない。Geist は旧パッケージの import 経由でしか入らないため、通常はこの時点で消える）。

```bash
grep -r "fonts.googleapis" dist
```
Expected: 0 件（exit 1）。

```bash
grep -rl "IBM Plex" dist/assets
```
Expected: CSS ファイルが 1 件以上ヒット。

- [ ] **Step 4: 既存テストが通ることを確認**

```bash
cd <リポジトリルート>
pnpm exec vp test apps/url-encoder
```

Expected: 5 files / 55 tests PASS（ベースラインと同一。コンポーネント未変更のため）。

- [ ] **Step 5: commit**

```bash
git add apps/url-encoder/src/index.css apps/url-encoder/package.json pnpm-lock.yaml
git commit -m "feat(url-encoder): トークンを @tools/design-tokens-elchika へ切替"
```

---

### Task 3: elchika-ui コンポーネント取り込み（toast 以外の 5 種）

**Files:**
- Create: `apps/url-encoder/components.json`
- Modify: `apps/url-encoder/src/components/ui/{button,card,input,label,select}.tsx`（elchika 版で置換）
- Modify: `apps/url-encoder/src/components/ui/__tests__/{button,card,input}.test.tsx`（新実装のクラス名へ追随）
- Modify: `apps/url-encoder/src/components/ui/{button,card,input,label,select}.stories.tsx`（API 差分があれば追随)
- Modify: `apps/url-encoder/package.json`（shadcn add が追加する依存）

**Interfaces:**
- Consumes: Task 1-2 のトークン基盤
- Produces: `@/components/ui/*` の elchika 版。Button/Card/Label は shadcn 語彙の props 互換が期待値（変わっていたら App.tsx も追随し申告）

- [ ] **Step 1: components.json を作成**

`apps/url-encoder/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "tsx": true,
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/lib/utils"
  },
  "registries": {
    "@elchika": "https://ui.elchika.dev/r/{name}.json"
  }
}
```

（shadcn CLI が他のフィールドを要求してエラーになる場合は CLI の指示に従って追加し、追加内容を申告する）

- [ ] **Step 2: 5 コンポーネントを add（dry-run 的に生成物を確認しながら）**

```bash
cd apps/url-encoder
npx shadcn@latest add @elchika/button @elchika/card @elchika/input @elchika/label @elchika/select
```

add 後に必ず確認・後始末（ui.elchika.dev「トークン置換の注意」が正本）:

1. `git status` で生成・変更されたファイルを列挙する
2. `src/components/ui/*.tsx` が elchika 版（`@base-ui/react` を import）へ置き換わったこと
3. アプリ内に落ちたトークン類 — `elchika-ui/` ディレクトリ（プロジェクトルート直下または src/ 配下）— は**削除**（共有パッケージへ一本化。Task 1 で取得済みの同内容）
4. `src/index.css` に追記された alias block（`:root { ... }` / `.dark { ... }` 等)は**削除**し、`@import "@tools/design-tokens-elchika";` 1 行だけに戻す
5. `src/lib/utils.ts` が生成された場合: 既存の `cn` ヘルパーの場所を確認（`@/lib/utils` が既存に無ければ新規生成で OK。既存と重複したら既存に寄せて申告）
6. `package.json` に `@base-ui/react` が追加されたことを確認

- [ ] **Step 3: ビルドで壊れ方を把握**

```bash
pnpm run build
```

toast 系（`toaster.tsx` / `useToast`）はまだ Radix 前提のため、この時点で通ることも通らないこともある。button/card/input/label/select 由来のエラーだけをこのタスクで解消する。toast 由来のエラーは Task 4 へ（このタスクではコミットに `--no-verify` 等の回避をしない。build が toast 由来でのみ失敗する状態なら、その旨をコミットメッセージに明記して次タスクへ進んでよい）。

- [ ] **Step 4: テストと stories を新実装へ追随**

```bash
cd <リポジトリルート>
pnpm exec vp test apps/url-encoder
```

`__tests__/{button,card,input}.test.tsx` の失敗を新実装に合わせて更新する。方針:

- **テスト観点は保持する**（variant ごとに描画が変わる・クリックハンドラが発火する・disabled が効く等）。クラス名アサーション（例 `toHaveClass('bg-primary')`）は新実装の実クラスへ書き換える（実クラスは取り込んだ `button.tsx` のソースを読んで確定）
- テストの削除だけで PASS にしない（spec rubric 1)
- stories は `pnpm storybook` を起動せずとも、props の型エラーを `pnpm run build`／`vp check` で検出して直す

Expected: `pnpm exec vp test apps/url-encoder` が toast 関連以外すべて PASS。

- [ ] **Step 5: lint と commit**

```bash
pnpm exec vp check <このタスクで変更した .tsx/.ts/.json ファイルを明示列挙>
git add apps/url-encoder/components.json apps/url-encoder/src/components apps/url-encoder/src/lib apps/url-encoder/package.json pnpm-lock.yaml
git commit -m "feat(url-encoder): button/card/input/label/select を elchika-inc/ui 版へ置換"
```

---

### Task 4: toast の Base UI 移行と Radix 依存の削除

**Files:**
- Modify: `apps/url-encoder/src/components/ui/toast.tsx`（elchika 版で置換）
- Delete: `apps/url-encoder/src/components/ui/toaster.tsx`
- Delete: `apps/url-encoder/src/hooks/useToast.ts`
- Modify: `apps/url-encoder/src/App.tsx`
- Modify: `apps/url-encoder/package.json`（Radix 依存削除）

**Interfaces:**
- Consumes: elchika toast.tsx の公開 API — `ToastToaster`（Provider+Viewport+List 一体、children を受ける）と `toast`（モジュールレベル manager、`toast.add({ title, description?, type? })`。type は `"success" | "info" | "warning" | "error" | "loading"`）
- Produces: 完成した url-encoder（Radix 依存ゼロ）

- [ ] **Step 1: elchika toast を add**

```bash
cd apps/url-encoder
npx shadcn@latest add @elchika/toast
```

add 後の後始末は Task 3 Step 2 と同じ（index.css の alias block 再追記の削除・アプリ内 `elchika-ui/` の削除。**add のたびに毎回発生する**）。registryDependencies で `@elchika/button` が再取得されても同内容なら問題ない。

- [ ] **Step 2: App.tsx を書き換え**

変更点（現行 App.tsx の toast 使用は 5 箇所）:

```tsx
// import: 旧
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/useToast";
// import: 新
import { ToastToaster, toast } from "@/components/ui/toast";
```

- コンポーネント内の `const { toast } = useToast();` を削除（`toast` はモジュールレベル manager）
- 呼び出しの置換:
  - `toast({ title: "Encoded successfully" })` → `toast.add({ title: "Encoded successfully" })`（成功系 3 箇所は `type: "success"` を付けてよい — 付けた場合は申告）
  - `toast({ title: "Encoding failed", variant: "destructive" })` → `toast.add({ title: "Encoding failed", type: "error" })`
  - `toast({ title: "Decoding failed", description: "Invalid URL sequence", variant: "destructive" })` → `toast.add({ title: "Decoding failed", description: "Invalid URL sequence", type: "error" })`
- JSX: `<Toaster />` を削除し、ルート要素を `<ToastToaster> ... </ToastToaster>` で包む
- `src/components/ui/toaster.tsx` と `src/hooks/useToast.ts` を削除（他に参照が無いことを `grep -rn "useToast\|toaster" src/` で確認してから）

- [ ] **Step 3: Radix 依存を削除**

`apps/url-encoder/package.json` から削除: `@radix-ui/react-label` / `@radix-ui/react-select` / `@radix-ui/react-slot` / `@radix-ui/react-toast`。

削除前に参照ゼロを実測: `grep -rn "@radix-ui" apps/url-encoder/src/` が 0 件であること（ヒットしたら該当コンポーネントの置換漏れ — Task 3 に戻る）。

```bash
cd <リポジトリルート>
pnpm install
```

- [ ] **Step 4: ビルドとテスト**

```bash
cd apps/url-encoder
pnpm run build
```
Expected: exit 0。`ls dist/assets/` に Geist の woff2 が**無い**こと・IBM Plex があることも再確認。

```bash
cd <リポジトリルート>
pnpm exec vp test apps/url-encoder
```
Expected: 全 PASS（toast 表示のテストが `toaster.tsx` 前提で存在した場合は elchika 版の観点に書き直す）。

- [ ] **Step 5: lint と commit**

```bash
pnpm exec vp check <変更した .tsx/.ts ファイルを明示列挙>
git add apps/url-encoder/src apps/url-encoder/package.json pnpm-lock.yaml
git commit -m "feat(url-encoder): toast を Base UI 版へ移行し Radix 依存を削除"
```

---

### Task 5: rubric 全項目の検証と目視確認

**Files:**
- 変更なし（検証のみ。修正が出たら該当タスクへ戻って直し、再検証）

spec の rubric（DoneCriteria 1-6）を**この順で全部**実測する:

- [ ] **Step 1: テスト** — リポジトリルートで `pnpm exec vp test apps/url-encoder` → exit 0・全 PASS
- [ ] **Step 2: パッケージテスト** — `pnpm exec vp test packages/design-tokens-elchika` → PASS（ネットワーク断でスキップした場合は再実行して実測を残す）
- [ ] **Step 3: ビルド** — `apps/url-encoder` で `pnpm run build` → exit 0。`grep -r "fonts.googleapis" dist` → 0 件。IBM Plex woff2 同梱・Geist 不在
- [ ] **Step 4: design-audit** — リポジトリルートで `node scripts/design-audit.js --app=url-encoder`

Expected: **違反は DS-002 の 1 件のみ（ベースラインと同一）**。新規違反が出たら audit スクリプトが旧トークン語彙前提の可能性をまず疑い、**直しに行かず司令塔へ報告**。実行後に必ず:

```bash
git checkout -- .docs/design-audit-result.json
```

- [ ] **Step 5: 影響範囲ゼロ確認** — `git diff --stat main...HEAD` の変更ファイルが `packages/design-tokens-elchika/` / `apps/url-encoder/` / `docs/superpowers/` / `pnpm-lock.yaml` のみであること。`packages/design-tokens/`（旧）や他アプリが 1 行でも出たら**失敗**
- [ ] **Step 6: 目視確認** — `cd apps/url-encoder` で `pnpm run dev` を起動し（**ポートは起動ログの実値を読む**）、ブラウザで:
  - Encode / Decode が動き、**成功 toast が表示される**
  - 不正入力（例: `%E0%A4%A`）の Decode で **error toast（destructive 色）が表示される**
  - Copy ボタンで toast 表示
  - `document.documentElement.classList.add('dark')` を DevTools で実行し dark 表示が崩れない
  - フォントが IBM Plex（DevTools の computed font-family で実測）
  - 確認は「表示される」でなく「操作して反応する」まで
- [ ] **Step 7: 完了報告** — 各 rubric の実測結果（コマンド・exit code・件数）を列挙して司令塔へ報告。計画から逸れた変更の申告を含める

---

### Task 6: 本番反映用の成果物準備（デプロイ自体は司令塔+human gate）

**Files:**
- Modify: `packages/router/public/url-encoder/`（ビルド生成物の差し替え）

- [ ] **Step 1: 生成物を router/public へ反映**

`packages/router/public/` はコミットが本番になる（deploy.yml はビルドしない）。url-encoder のみ更新:

```bash
cd apps/url-encoder
pnpm run build
rm -rf ../../packages/router/public/url-encoder
cp -R dist ../../packages/router/public/url-encoder
```

- [ ] **Step 2: アセットパス検査**

```bash
cd <リポジトリルート>
node scripts/check-asset-paths.js
```

Expected: exit 0（違反 0 件）。

- [ ] **Step 3: commit と push**

```bash
git add packages/router/public/url-encoder
git commit -m "build(router): url-encoder の elchika-ui 版ビルドを反映"
git push -u origin naoto24kawa/elchika-ui-pilot
```

- [ ] **Step 4: PR 作成**

```bash
gh pr create --repo elchika-inc/tools --title "feat(url-encoder): elchika-inc/ui 適用パイロット" --body "<spec への参照・rubric 実測結果・申告事項を記載>"
```

PR 本文に含める: spec パス / rubric 1-6 の実測結果（Task 5 Step 7 の内容）/ 計画から逸れた変更の申告 / 「デプロイ（rubric 7-8）はマージ後に司令塔が手動実行」の明記。

**このタスクの後、worker は停止して司令塔の完了ゲートを待つ。マージ・`packages/router && pnpm run deploy`・デプロイ後 2 段階確認（rubric 7-8）は司令塔が human 承認後に実施する。**
