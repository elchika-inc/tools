# elchika-ui 展開 PR4（focus-ring の standards §5 統一）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App.tsx に直書きされた旧フォーカスリング実装（127ファイル）を standards §5 の形へ揃え、elchika-ui へ未移行の textarea コンポーネント（10ファイル）を Base UI 版へ移行する。

**Architecture:** 旧実装は文字列パターンが安定している（実測で上位8パターンが同一の並び）ため、文字列置換の codemod で処理できる。textarea は elchika-ui registry に対応物があるため、PR2 の slider/switch と同じ手順で移行する。

**Tech Stack:** Node.js codemod / Base UI (`@base-ui/react`) / Vite+ (`vp`) / Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-08-09-elchika-ui-rollout-design.md`（PR1〜PR3 と同じ設計。本 PR はその残件処理）

**前提:** PR1（#852）・PR2（#853）・PR3（#854）はマージ・本番反映済み。346アプリが elchika-ui へ移行し、Radix 参照はゼロ、health-check 346/346 正常。

## ユーザー決定（2026-08-09）

focus-ring の残り139ファイルを**今回まとめて直す**。

## standards §5 の規定（正本）

`~/projects/elchika-inc/standards/DESIGN.md` §5（SHOULD）:

```
focus-visible:ring-[3px] focus-visible:ring-ring
```

`/50` 等の透明度合成は light 背景で非テキストコントラスト 3:1（WCAG 1.4.11）を割るため使わない。
`ring-[3px]` は standards が定める例外パターンであり、arbitrary value 回避の違反に数えない。

## 実測で確定した事実（2026-08-09。再調査不要）

対象は **138ファイル**（PR3 マージ後の最新状態で計測）:

| 場所 | 件数 |
|---|---|
| `App.tsx` | 127 |
| `components/ui/textarea.tsx` | 10 |
| `components/TextInput.tsx` | 1 |

App.tsx に現れる旧実装の記述パターン（出現数の多い順。**すべて同じ並びで始まる**）:

| パターン | 件数 |
|---|---|
| `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none` | 132 |
| `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none` | 32 |
| `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | 32 |
| `focus-visible:ring-2 focus-visible:ring-ring`（offset なし） | 10 |
| （以下、上記の後ろに `font-mono` 等が続く変種） | — |

その他の実測値:

- `ring-offset-background` を含むアプリ: **130**（`ring-offset-2` とセットで使われている）
- `focus-visible:ring-*/50` 等の透明度合成: **0件**（PR2 時点で解消済み）
- elchika-ui registry の Textarea: `https://ui.elchika.dev/r/textarea.json` が **200**
- `components/ui/textarea.tsx` を App.tsx から import しているアプリ: **9**

## Global Constraints

- **指示（この計画）と実態が矛盾したら、勝手に直さず `orca orchestration ask` で司令塔へ報告して指示を待つ**
- 裁量範囲: 公開シグネチャと完了条件は変えない。計画に無い変更はすべて `worker_done` と PR 本文で申告する
- レビューサイクルは worker 側で完結する（確信度80%以上の指摘が0になるまで修正→再レビュー、上限3ラウンド）
- `apps/*/vite.config.ts` は触らない・整形しない
- `*.md` と `packages/design-tokens-elchika/` 配下を Oxfmt で整形しない
- **検証の前に必ずリポジトリルートで `pnpm install` を実行する**
- テストはリポジトリルートから `pnpm exec vp test <パス>`
- lint/format は変更ファイルを明示列挙した `pnpm exec vp check <paths...>`
- 検証コマンドを `;` / `&&` / pipe で連結しない。シェルから直接 `rm -rf` を実行しない
- コミットは `git add <明示パス>` で行う
- **DS-009（コンテナ幅の統一）は本 PR のスコープ外**（PR5 で扱う）
- **DS-004 の残件も本 PR のスコープ外**

## ベースライン（司令塔が実測済み。これを判定基準にする）

```
pnpm install 実行後の pnpm exec vp test:
  Test Files  12 failed
  Tests  7 failed | 6871 passed | 5 skipped   → exit 1
```

既存失敗（移行と無関係。**直さない**）:
`bcrypt-hash` / `file-rename-batch`(2) / `geo-distance` / `hash-crc32` / `hash-md5` /
`k8s-yaml-generator` / `markdown-to-slides` / `nato-phonetic` / `sql-playground` /
`zip-creator` / `packages/mcp-server` / `packages/router`

その他: `build-all.sh` 346/346 成功 / `check-asset-paths.js` exit 0 /
`health-check-runtime.js` 346/346 / `design-audit.js` 758件 / `public/` 144MB

---

### Task 1: textarea を elchika-inc/ui 版へ移行

**Files:**
- Modify: `apps/*/src/components/ui/textarea.tsx`（10ファイル）
- Modify: 上記アプリの `package.json`（必要なら）

**Interfaces:**
- Produces: 全アプリの UI コンポーネントが elchika-ui 由来になる

- [ ] **Step 1: 対象アプリを特定する**

```bash
ls apps/*/src/components/ui/textarea.tsx
```
Expected: 10ファイル。アプリ名を記録する

- [ ] **Step 2: elchika-ui 版を1アプリで取得する**

対象アプリのうち1つ（例: `text-counter`）で:

```bash
cd apps/text-counter
npx shadcn@latest add @elchika/textarea
```

**add 後の後始末（PR2 と同じ。毎回必要）**:

1. `git status` で生成・変更されたファイルを列挙する
2. `src/index.css` に追記された alias block（`:root { ... }` / `.dark { ... }` 等）を**削除**し、
   `@import "@tools/design-tokens-elchika";` の1行だけに戻す
3. アプリ内に落ちた `elchika-ui/` ディレクトリがあれば**削除**する（共有パッケージへ一本化済み）
4. `package.json` に不要な依存が追加されていないか確認する（`@base-ui/react` は既にあるはず）

- [ ] **Step 3: 生成された textarea.tsx を正本として他9アプリへ配る**

```bash
node -e "const fs=require('fs');const src=fs.readFileSync('apps/text-counter/src/components/ui/textarea.tsx','utf8');const g=require('node:fs').readdirSync('apps').filter(a=>fs.existsSync('apps/'+a+'/src/components/ui/textarea.tsx'));let n=0;for(const a of g){if(a==='text-counter')continue;fs.writeFileSync('apps/'+a+'/src/components/ui/textarea.tsx',src);n++}console.log('配布: '+n+' アプリ')"
```
Expected: 9アプリへ配布

```bash
pnpm install
```

- [ ] **Step 4: 公開シグネチャの互換を確認する**

elchika-ui 版の props が旧版と互換でない場合、利用側（App.tsx）の追随が必要:

```bash
grep -n "export" apps/text-counter/src/components/ui/textarea.tsx
```

```bash
pnpm exec vp test apps/text-counter apps/text-deduplicate apps/text-diff-checker apps/ascii-chart apps/chart-builder apps/er-diagram apps/gantt-chart apps/mermaid-preview apps/plantuml-preview apps/treemap-generator
```
Expected: exit 0。型エラーや props 不一致が出たら利用側を追随させ、**変更内容を申告する**

- [ ] **Step 5: ビルド確認**

10アプリを個別にビルドする（1つずつ実行し、失敗したものを記録）:

```bash
pnpm --filter text-counter build
```

（`build` の filter 実行は正しい。`test` だけが filter 不可）

- [ ] **Step 6: commit**

```bash
pnpm exec vp check <変更した .tsx ファイルを明示列挙>
```

```bash
git add apps pnpm-lock.yaml
git commit -m "feat(ui): textarea を elchika-inc/ui 版へ移行"
```

---

### Task 2: focus-ring を standards §5 の形へ統一する codemod

**Files:**
- Create: `scripts/codemods/fix-focus-ring.js`
- Test: `scripts/__tests__/fixFocusRing.test.ts`
- Modify: `apps/*/src/App.tsx`（127ファイル）+ `apps/*/src/components/TextInput.tsx`（1ファイル）

**Interfaces:**
- Produces: `focusRingToStandards(source: string): { changed: boolean, source: string }` を export し、
  `node scripts/codemods/fix-focus-ring.js` が全アプリへ適用する

- [ ] **Step 1: 変換ロジックの失敗するテストを書く**

`scripts/__tests__/fixFocusRing.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { focusRingToStandards } from "../codemods/fix-focus-ring.js";

describe("focusRingToStandards", () => {
  it("ring-2 + ring-offset-2 を standards §5 の形へ変換する", () => {
    const src = `className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"`;
    const r = focusRingToStandards(src);
    expect(r.changed).toBe(true);
    expect(r.source).toContain("focus-visible:ring-[3px] focus-visible:ring-ring");
    expect(r.source).not.toContain("ring-offset-2");
  });

  it("後続クラスを保持する", () => {
    const src = `className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none font-mono"`;
    const r = focusRingToStandards(src);
    expect(r.source).toContain("resize-none");
    expect(r.source).toContain("font-mono");
  });

  it("offset が無いパターンも ring-[3px] にする", () => {
    const src = `className="focus-visible:ring-2 focus-visible:ring-ring"`;
    const r = focusRingToStandards(src);
    expect(r.changed).toBe(true);
    expect(r.source).toContain("focus-visible:ring-[3px] focus-visible:ring-ring");
  });

  it("ring-offset-background も取り除く", () => {
    const src = `className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"`;
    const r = focusRingToStandards(src);
    expect(r.source).not.toContain("ring-offset-background");
  });

  it("既に standards の形なら変更しない（冪等）", () => {
    const src = `className="focus-visible:ring-[3px] focus-visible:ring-ring"`;
    const r = focusRingToStandards(src);
    expect(r.changed).toBe(false);
    expect(r.source).toBe(src);
  });

  it("focus-visible 以外の ring-2 は触らない", () => {
    const src = `className="ring-2 ring-border"`;
    expect(focusRingToStandards(src).changed).toBe(false);
  });

  it("透明度合成を新たに生まない", () => {
    const src = `className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"`;
    const r = focusRingToStandards(src);
    expect(r.source).not.toMatch(/ring-ring\/\d/);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm exec vp test scripts/__tests__/fixFocusRing.test.ts
```
Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: codemod を実装**

`scripts/codemods/fix-focus-ring.js` を作る。要件:

- `focus-visible:ring-2` を `focus-visible:ring-[3px]` に置換する
- `focus-visible:ring-offset-2` と `ring-offset-background` を**削除する**
  （standards §5 は offset を使わない形。削除後に**余分な空白が残らない**よう正規化する）
- `focus-visible:` が付かない `ring-2` / `ring-offset-*` には触らない
  （フォーカスリング以外の装飾を壊さないため）
- 既に `ring-[3px]` の箇所は変更しない（冪等）
- 対象は `apps/*/src/**/*.tsx`（`.stories.` と `__tests__` を除く）
- 処理したファイル数と、ファイルごとの置換件数を stdout に出す。**サイレントな skip をしない**

`focusRingToStandards(source)` を export して Step 1 のテスト対象にする。

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm exec vp test scripts/__tests__/fixFocusRing.test.ts
```
Expected: 7 tests PASS

- [ ] **Step 5: カナリア1アプリで適用して目視確認**

```bash
node scripts/codemods/fix-focus-ring.js text-counter
```

（引数でアプリを絞れる実装にする。絞れない場合は全適用してから1アプリを確認する）

```bash
cd apps/text-counter
pnpm run dev
```

**起動ログのポート実値を読む**。ブラウザで開き、次を確認する:

- Tab キーでフォーカスを移動し、**フォーカスリングが見える**こと
- DevTools でフォーカス中の要素の computed style を確認し、
  `outline` / `box-shadow` によるリングの外縁が **3px** であること（旧実装は offset 込みで 4px）
- light と dark（`document.documentElement.dataset.theme` で切替）の**両方で視認できる**こと
- リングの色が背景に対して十分なコントラストを持つこと（薄すぎて見えない状態になっていないこと）

**フォーカスリングが見えなくなった場合は止めて報告する**（a11y の後退は許容しない）。

- [ ] **Step 6: 全アプリへ適用**

```bash
node scripts/codemods/fix-focus-ring.js
```

処理件数を記録する。冪等性を確認する（2回目は 0 件）:

```bash
node scripts/codemods/fix-focus-ring.js
```
Expected: 変更 0 件

- [ ] **Step 7: 残存検査**

```bash
grep -rn "focus-visible:ring-offset" apps/*/src
```
Expected: 0件（exit 1）

```bash
grep -rn "focus-visible:ring-2" apps/*/src
```
Expected: 0件（exit 1）

```bash
grep -rn "focus-visible:ring-ring/[0-9]" apps/*/src
```
Expected: 0件（exit 1。透明度合成を新たに生んでいないこと）

standards §5 準拠を数える:

```bash
node -e "const fs=require('fs'),g=require('node:fs');let n=0;for(const a of g.readdirSync('apps')){const p='apps/'+a+'/src/App.tsx';if(!fs.existsSync(p))continue;if(fs.readFileSync(p,'utf8').includes('focus-visible:ring-[3px]'))n++}console.log('App.tsx で ring-[3px] を持つアプリ: '+n)"
```
実測値を記録する。

- [ ] **Step 8: 全体テストとビルド**

リポジトリルートで:

```bash
pnpm install
```

```bash
pnpm exec vp test
```
Expected: 失敗が**ベースライン（12 files / 7 tests）と同一以下**。新規失敗ゼロ

```bash
bash scripts/build-all.sh
```
Expected: exit 0（346/346）

```bash
node scripts/check-asset-paths.js
```
Expected: exit 0

- [ ] **Step 9: commit**

```bash
pnpm exec vp check scripts/codemods/fix-focus-ring.js scripts/__tests__/fixFocusRing.test.ts
```

```bash
git add scripts apps
git commit -m "fix(a11y): フォーカスリングを standards §5 の形へ統一"
```

```bash
git add packages/router/public
git commit -m "build(router): focus-ring 統一を反映して再生成"
```

---

### Task 3: 最終検証と PR 作成

- [ ] **Step 1: 全項目を実測**

各コマンドを単独実行して結果を記録する:

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

- [ ] **Step 2: push と PR 作成**

```bash
git push -u origin naoto24kawa/elchika-ui-focusring
```

```bash
gh pr create --repo elchika-inc/tools --title "fix(a11y): フォーカスリングを standards §5 へ統一し textarea を Base UI へ移行" --body "<下記を記載>"
```

PR 本文に含める: この計画へのパス / rubric 各項目の実測値 / 変換した件数 /
カナリアの目視確認結果（リング幅・light/dark での視認性）/ レビュー記録 /
計画から逸れた変更の申告 / 実装担当: Codex /
「マージ・デプロイは司令塔が human 承認後に実施」の明記。

**worker はここで停止し、司令塔の完了ゲートを待つ。**

## PR4 の完了条件（rubric）

1. `pnpm exec vp test` の失敗が**ベースライン（12 files / 7 tests）と同一以下**。新規失敗ゼロ
2. `bash scripts/build-all.sh` が exit 0（346/346）
3. `node scripts/check-asset-paths.js` が exit 0
4. `grep -rn "focus-visible:ring-offset" apps/*/src` が **0件**
5. `grep -rn "focus-visible:ring-2" apps/*/src` が **0件**
6. `grep -rn "focus-visible:ring-ring/[0-9]" apps/*/src` が **0件**（透明度合成を生んでいない）
7. `ls apps/*/src/components/ui/textarea.tsx` の全ファイルが elchika-ui 版
   （`@base-ui/react` 由来であることを1ファイル読んで確認）
8. カナリアアプリで**フォーカスリングが light / dark 双方で視認でき、外縁が 3px** であることを目視実測
9. `node scripts/design-audit.js` の違反が **758件から増えていない**
10. `packages/router/public/` が 200MB 未満
11. `apps/*/vite.config.ts` に差分が無い
