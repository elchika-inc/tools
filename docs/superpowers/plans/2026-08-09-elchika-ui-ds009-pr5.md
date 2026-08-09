# elchika-ui 展開 PR5（DS-009 コンテナ幅の統一）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** DS-009 に違反している181アプリの主コンテナ幅を `max-w-5xl` に統一し、design-audit の DS-009 違反をゼロにする。

**Architecture:** 181アプリのうち177は `mx-auto` と `max-w-*` を同じ className に持つ要素が1つだけ（実測）なので、文字列置換の codemod で安全に処理できる。残り4アプリは構造が異なるため個別対応する。

**Tech Stack:** Node.js codemod / Tailwind CSS v4 / Vite+ (`vp`)

**前提:** PR1（#852）・PR2（#853）・PR3（#854）・PR4（#855）はマージ・本番反映済み。health-check 346/346 正常。

## ユーザー決定（2026-08-09）

DS-009 は**幅を統一する**。統一先は **`max-w-5xl`**。

`max-w-5xl` を選ぶ理由（司令塔が実測して提示、ユーザーが承認）: DS-009 が許す3値
（`max-w-5xl` / `max-w-6xl` / `max-w-7xl`）の最小値であり、違反アプリの最多である
`max-w-4xl`（116アプリ）からの変化が 56rem → 64rem（約14%増）で最も小さい。
`max-w-6xl` だと 4xl から約29%増、2xl から約71%増となり、意図的に狭くしている
画面（電卓系など）が大きく間延びする。

**この PR は346アプリ中181アプリの表示幅を実際に変える。** 見た目の変更を伴うため、
カナリアでの目視確認を必須とする。

## 実測で確定した事実（2026-08-09。再調査不要）

DS-009 の判定ロジック（`scripts/design-audit.js:146-154`）:
**App.tsx が `max-w-7xl` / `max-w-6xl` / `max-w-5xl` のいずれも含まなければ違反**。
main 要素である必要はなく、App.tsx のどこかにあれば準拠になる。

違反181アプリの `max-w` 使用パターン:

| パターン | アプリ数 | 例 |
|---|---|---|
| `max-w-4xl` のみ | 116 | alt-text-helper |
| `max-w-2xl` のみ | 31 | aes-encrypt |
| `max-w-md` のみ | 7 | color-picker |
| `max-w-3xl` のみ | 7 | csp-builder |
| `max-w-4xl` + `max-w-full` | 7 | file-metadata-viewer |
| `max-w-xl` のみ | 3 | bmi-calculator |
| その他（複合） | 10 | data-anonymizer / decision-wheel / flashcard / morpheme-analyzer 等 |

主コンテナ（`mx-auto` と `max-w-*` を同じ className に持つ要素）の数:

| 該当要素の数 | アプリ数 | 扱い |
|---|---|---|
| 1つ | **177** | codemod で機械変換 |
| 2つ | 2（video-rotate / video-watermark） | 個別対応 |
| 3つ | 1（flashcard） | 個別対応 |
| 0個 | 1 | 個別対応 |

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
- **DS-009 に違反していない165アプリには触れない**（既に 5xl/6xl/7xl を持つアプリの幅を変えない）
- **`max-w-full` / `max-w-[任意値]` / 内側要素の狭い幅には触れない**（主コンテナのみが対象）

## ベースライン（司令塔が実測済み。これを判定基準にする）

```
pnpm install 実行後の pnpm exec vp test:
  Test Files  12 failed
  Tests  7 failed | 6879 passed | 5 skipped   → exit 1
```

既存失敗（移行と無関係。**直さない**）:
`bcrypt-hash` / `file-rename-batch`(2) / `geo-distance` / `hash-crc32` / `hash-md5` /
`k8s-yaml-generator` / `markdown-to-slides` / `nato-phonetic` / `sql-playground` /
`zip-creator` / `packages/mcp-server` / `packages/router`

その他: `build-all.sh` 346/346 / `check-asset-paths.js` exit 0 /
`health-check-runtime.js` 346/346 / `design-audit.js` **758件**（DS-004 538 / DS-009 181 /
DS-001 29 / DS-003 8 / DS-002 2）/ `public/` 144MB

---

### Task 1: 幅統一の codemod を書く

**Files:**
- Create: `scripts/codemods/unify-container-width.js`
- Test: `scripts/__tests__/unifyContainerWidth.test.ts`

**Interfaces:**
- Produces: `unifyContainerWidth(source: string): { changed: boolean, source: string, count: number }`
  を export し、`node scripts/codemods/unify-container-width.js [app...]` が適用する

- [ ] **Step 1: 変換ロジックの失敗するテストを書く**

`scripts/__tests__/unifyContainerWidth.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { unifyContainerWidth } from "../codemods/unify-container-width.js";

describe("unifyContainerWidth", () => {
  it("mx-auto と同居する max-w-4xl を max-w-5xl にする", () => {
    const src = `<div className="mx-auto max-w-4xl space-y-6">`;
    const r = unifyContainerWidth(src);
    expect(r.changed).toBe(true);
    expect(r.source).toContain("mx-auto max-w-5xl");
  });

  it("max-w が先に来る並びも扱える", () => {
    const src = `<div className="max-w-2xl mx-auto space-y-6">`;
    const r = unifyContainerWidth(src);
    expect(r.source).toContain("max-w-5xl mx-auto");
  });

  it("mx-auto と同居しない max-w には触れない", () => {
    const src = `<div className="max-w-md rounded border">`;
    expect(unifyContainerWidth(src).changed).toBe(false);
  });

  it("max-w-full には触れない", () => {
    const src = `<div className="mx-auto max-w-full">`;
    expect(unifyContainerWidth(src).changed).toBe(false);
  });

  it("任意値 max-w-[250px] には触れない", () => {
    const src = `<div className="mx-auto max-w-[250px]">`;
    expect(unifyContainerWidth(src).changed).toBe(false);
  });

  it("既に max-w-5xl なら変更しない（冪等）", () => {
    const src = `<div className="mx-auto max-w-5xl">`;
    const r = unifyContainerWidth(src);
    expect(r.changed).toBe(false);
    expect(r.source).toBe(src);
  });

  it("既に max-w-6xl / 7xl のものは変更しない（準拠済みの幅を狭めない）", () => {
    expect(unifyContainerWidth(`<div className="mx-auto max-w-6xl">`).changed).toBe(false);
    expect(unifyContainerWidth(`<div className="mx-auto max-w-7xl">`).changed).toBe(false);
  });

  it("他のクラスを保持する", () => {
    const src = `<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">`;
    const r = unifyContainerWidth(src);
    expect(r.source).toContain("px-4");
    expect(r.source).toContain("lg:px-8");
  });

  it("変換件数を返す", () => {
    const src = `<div className="mx-auto max-w-4xl"><div className="mx-auto max-w-2xl">`;
    expect(unifyContainerWidth(src).count).toBe(2);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm exec vp test scripts/__tests__/unifyContainerWidth.test.ts
```
Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: codemod を実装**

`scripts/codemods/unify-container-width.js` を作る。要件:

- **`className` 属性の中で `mx-auto` と同居する `max-w-{md,xl,2xl,3xl,4xl}` のみ**を
  `max-w-5xl` に置換する
- `max-w-full` / `max-w-[任意値]` / `max-w-screen-*` には**触れない**
- 既に `max-w-5xl` / `6xl` / `7xl` のものには**触れない**（準拠済みの幅を狭めない・冪等）
- `mx-auto` を含まない className の `max-w-*` には**触れない**（内側の狭い要素を守る）
- 対象は `apps/<app>/src/App.tsx` のみ（他のコンポーネントファイルには触れない）
- 引数でアプリ名を絞れるようにする。引数なしなら DS-009 違反アプリ全件
- 処理したアプリ数・変更したファイル数・置換件数を stdout に出す。**サイレントな skip をしない**
- **主コンテナが2つ以上あるアプリ（video-rotate / video-watermark / flashcard）と
  `mx-auto` を持たないアプリは処理せず、「要個別対応」として名前を出力する**

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm exec vp test scripts/__tests__/unifyContainerWidth.test.ts
```
Expected: 9 tests PASS

- [ ] **Step 5: commit**

```bash
pnpm exec vp check scripts/codemods/unify-container-width.js scripts/__tests__/unifyContainerWidth.test.ts
```

```bash
git add scripts/codemods/unify-container-width.js scripts/__tests__/unifyContainerWidth.test.ts
git commit -m "feat(codemod): コンテナ幅を max-w-5xl へ統一する codemod を追加"
```

---

### Task 2: カナリア2アプリで見た目を確認する

**Files:**
- Modify: `apps/aes-encrypt/src/App.tsx`（max-w-2xl → 5xl。**変化が最も大きい側**）
- Modify: `apps/alt-text-helper/src/App.tsx`（max-w-4xl → 5xl。**最多パターン**）

変化の大きい側と最多パターンの両方を見ることで、影響の幅を把握する。

- [ ] **Step 1: カナリア2アプリへ適用**

```bash
node scripts/codemods/unify-container-width.js aes-encrypt alt-text-helper
```
Expected: 2アプリ / 2ファイル変更。置換件数を記録する

```bash
git diff apps/aes-encrypt/src/App.tsx apps/alt-text-helper/src/App.tsx
```
差分が主コンテナ1箇所ずつであることを目視で確認する。

- [ ] **Step 2: aes-encrypt を目視確認（変化が大きい側）**

```bash
cd apps/aes-encrypt
pnpm run dev
```

**起動ログのポート実値を読む**。ブラウザで開き、次を確認する:

- コンテンツ幅が広がっていること（`max-w-2xl` = 42rem → `max-w-5xl` = 64rem）
- **入力欄やボタンが間延びして使いにくくなっていないか**
- レイアウトが崩れていないか（要素の重なり・はみ出し・折り返しの破綻がない）
- ウィンドウ幅を狭めたときのレスポンシブ挙動が壊れていないか
- console に error / warn が出ていない

**レイアウトが崩れた場合、または明らかに使いにくくなった場合は止めて報告する。**

確認後、dev サーバーを停止する。

- [ ] **Step 3: alt-text-helper を目視確認（最多パターン）**

同様に dev サーバーで確認する（`max-w-4xl` = 56rem → `max-w-5xl` = 64rem。変化は小さい）。

- [ ] **Step 4: 両アプリのビルドとテスト**

```bash
pnpm --filter aes-encrypt build
```

```bash
pnpm --filter alt-text-helper build
```

リポジトリルートで:

```bash
pnpm exec vp test apps/aes-encrypt apps/alt-text-helper
```
Expected: exit 0

- [ ] **Step 5: commit**

```bash
git add apps/aes-encrypt apps/alt-text-helper
git commit -m "fix(design): カナリア2アプリのコンテナ幅を max-w-5xl へ統一"
```

---

### Task 3: 残りの175アプリへ適用し、個別対応4件を処理する

- [ ] **Step 1: 全違反アプリへ適用**

```bash
node scripts/codemods/unify-container-width.js
```

処理件数と「要個別対応」リストを記録する。冪等性を確認する:

```bash
node scripts/codemods/unify-container-width.js
```
Expected: 変更 0 件

- [ ] **Step 2: 個別対応4件を処理する**

対象: `video-rotate` / `video-watermark`（主コンテナ2つ）/ `flashcard`（3つ）/
`mx-auto` を持たない1アプリ（codemod の出力で特定する）。

各アプリの App.tsx を読み、**ページの主コンテンツを囲む最も外側のコンテナ**を1つ特定して
`max-w-5xl` にする。内側の狭い要素（カード内の幅制限など）には触れない。

**どれが主コンテナか判断できないアプリがあれば、そのアプリ名と構造を報告して指示を仰ぐ**
（機械的に決め打ちしない）。

- [ ] **Step 3: DS-009 の解消を確認**

```bash
node scripts/design-audit.js
```

```bash
python3 -c "
import json
d = json.load(open('.docs/design-audit-result.json'))
n = sum(1 for a in d['apps'] for v in a.get('violations',[]) if v.get('rule')=='DS-009')
print('DS-009 違反:', n)
print('総違反:', d['summary']['totalViolations'])
"
```
Expected: DS-009 violations が **0件**、総違反が **758 - 181 = 577件**

```bash
git checkout -- .docs/design-audit-result.json
```

- [ ] **Step 4: 触ってはいけない範囲に手が入っていないか検査**

```bash
git diff --name-only HEAD~1 -- apps
```
変更が `App.tsx` のみであること（他のコンポーネントファイルが含まれないこと）を確認する。

```bash
git diff HEAD~1 -- apps > /tmp/ds009-diff.txt
```

```bash
grep -c "max-w-full\|max-w-\[" /tmp/ds009-diff.txt
```
Expected: 0（`max-w-full` と任意値に触れていないこと）

- [ ] **Step 5: 全体テストとビルド**

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

- [ ] **Step 6: commit**

```bash
pnpm exec vp check <変更した App.tsx を明示列挙。数が多い場合は分割して実行する>
```

```bash
git add apps
git commit -m "fix(design): DS-009 違反アプリのコンテナ幅を max-w-5xl へ統一"
```

```bash
git add packages/router/public
git commit -m "build(router): コンテナ幅統一を反映して再生成"
```

---

### Task 4: 最終検証と PR 作成

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
git push -u origin naoto24kawa/elchika-ui-ds009
```

```bash
gh pr create --repo elchika-inc/tools --title "fix(design): DS-009 コンテナ幅を max-w-5xl へ統一" --body "<下記を記載>"
```

PR 本文に含める: この計画へのパス / rubric 各項目の実測値 / 変換したアプリ数と置換件数 /
個別対応した4アプリとその判断 / **カナリア2アプリの目視確認結果（幅の変化・レイアウト崩れの有無）** /
レビュー記録 / 計画から逸れた変更の申告 / 実装担当: Codex /
**「181アプリの表示幅が実際に変わる変更である」ことの明記** /
「マージ・デプロイは司令塔が human 承認後に実施」の明記。

**worker はここで停止し、司令塔の完了ゲートを待つ。**

## PR5 の完了条件（rubric）

1. `pnpm exec vp test` の失敗が**ベースライン（12 files / 7 tests）と同一以下**。新規失敗ゼロ
2. `bash scripts/build-all.sh` が exit 0（346/346）
3. `node scripts/check-asset-paths.js` が exit 0
4. `node scripts/design-audit.js` の **DS-009 違反が 0件**
5. 総違反が **577件**（758 − 181）。DS-004 / DS-001 / DS-002 / DS-003 の件数が増えていないこと
6. 変更されたファイルが `apps/*/src/App.tsx` と `scripts/` と `packages/router/public/` のみ
7. 差分に `max-w-full` と `max-w-[任意値]` への変更が**含まれていない**
8. **カナリア2アプリ（aes-encrypt / alt-text-helper）の目視確認**で
   レイアウト崩れが無く、レスポンシブ挙動が壊れていないこと
9. `apps/*/vite.config.ts` に差分が無い
10. `packages/router/public/` が 200MB 未満
