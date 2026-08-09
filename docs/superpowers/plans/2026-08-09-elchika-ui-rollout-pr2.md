# elchika-ui 全アプリ展開 PR2（345アプリ）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 残り345アプリを elchika-inc/ui（Base UI）+ `@tools/design-tokens-elchika` + 共有フォント配信へ移行し、本番反映する。

**Architecture:** コンポーネントは url-encoder 成果物のファイル置換（344ファイル中339が既にバイト単位同一のため変換不要）。toast は ts-morph による AST 変換。カナリア1アプリ → 外れ値dry-run → 一括、の順で進め、失敗したアプリのみ個別処理する。

**Tech Stack:** ts-morph (AST変換) / Node.js codemod / Vite+ (`vp`) / Base UI / Cloudflare Workers

**Spec:** `docs/superpowers/specs/2026-08-09-elchika-ui-rollout-design.md`（承認済み。判断に迷ったら spec が正）

**前提:** PR1（フォント共有化）はマージ・本番反映済み（PR #852 / merge `b06673c9`）。
`packages/router/public/fonts/` に woff2 402個（4.56MB）と `fonts.css` が配置済みで、
`https://tools.elchika.app/fonts/fonts.css` の配信を実測確認済み。

## PR1 で確定した実測値（PR2 の期待値の基礎）

| 項目 | 値 |
|---|---|
| url-encoder の `dist/assets` | 2ファイル / 0.30MB |
| url-encoder の CSS | 47,674 バイト |
| 旧方式アプリ（aes-encrypt）の `public/` 配下 | 372KB |
| `packages/router/public/` 合計 | 160MB |
| 共有フォント | woff2 402個 / 4.56MB |

移行後の1アプリのサイズは旧方式とほぼ同等（0.30MB 対 0.37MB）。
したがって **345アプリ移行後も `public/` は 160MB 前後に留まる見込み**。
200MB を大きく超えたら想定外なので調査対象。

## Global Constraints

- **指示（この計画・spec）と実態が矛盾したら、勝手に直さず `orca orchestration ask` で司令塔へ報告して指示を待つ**
- 裁量範囲: 公開シグネチャと完了条件は変えない。計画に無い変更はすべて `worker_done` と PR 本文で申告する
- レビューサイクルは worker 側で完結する（確信度80%以上の指摘が0になるまで修正→再レビュー、上限3ラウンド）
- `apps/*/vite.config.ts` は触らない・整形しない（`base: './'` 維持。346/346 が正しい状態）
- `*.md` と `tokens.css` 系ファイルを Oxfmt で整形しない
- **検証の前に必ずリポジトリルートで `pnpm install` を実行する**
- テストはリポジトリルートから `pnpm exec vp test <パス>`
- lint/format は変更ファイルを明示列挙した `pnpm exec vp check <paths...>`
- 検証コマンドを `;` / `&&` / pipe で連結しない。シェルから直接 `rm -rf` を実行しない
  （スクリプト内の記述、および `git rm -r` は可）
- コミットは `git add <明示パス>` で行う
- **`home` アプリは対象外**（button のみを持つランディングページで構成が特殊。触らない）

## ベースライン（司令塔が実測済み。これを判定基準にする）

```
pnpm install 実行後の pnpm exec vp test:
  Test Files  12 failed | 688 passed (700)
  Tests  7 failed | 6850 passed | 5 skipped (6862)   → exit 1
```

既存失敗（移行と無関係。**直さない**）:
`bcrypt-hash` / `file-rename-batch`(2) / `geo-distance` / `hash-crc32` / `hash-md5` /
`k8s-yaml-generator` / `markdown-to-slides` / `nato-phonetic` / `sql-playground` /
`zip-creator` / `packages/mcp-server` / `packages/router`

design-audit ベースライン: **1,161 件 / 336 アプリ違反**
（DS-004 577 / DS-002 366 / DS-009 181 / DS-001 29 / DS-003 8 / DS-010 5）

---

### Task 1: health-check-runtime.js を共有資産に対応させる

**Files:**
- Modify: `scripts/health-check-runtime.js`

**Interfaces:**
- Produces: `node scripts/health-check-runtime.js` が `public/fonts/` をアプリとして
  検査せず、346/346 を返す状態

- [ ] **Step 1: 現状の失敗を再現する**

```bash
node scripts/health-check-runtime.js
```
Expected: exit 1。末尾に `正常: 346 / 347` と `fonts: HTTP 404` が出る。
これは `packages/router/public/fonts/` をアプリ扱いして `/fonts/` の index.html を
探しているため（PR1 で追加した共有資産。アプリではない）。

- [ ] **Step 2: fonts を走査対象から除外する**

`scripts/health-check-runtime.js` でアプリ一覧を作っている箇所を特定し、
`fonts` を除外する。`scripts/check-asset-paths.js` が PR1 で同じ対応を入れているので、
**その実装に合わせる**（除外リストの持ち方・命名を揃える）。

```bash
grep -n "fonts" scripts/check-asset-paths.js
```
で PR1 の実装を確認してから書く。

- [ ] **Step 3: 修正後の実測**

```bash
node scripts/health-check-runtime.js
```
Expected: exit 0、`正常: 346 / 346`

```bash
git checkout -- .docs/health-check-result.json
```

- [ ] **Step 4: lint と commit**

```bash
pnpm exec vp check scripts/health-check-runtime.js
```

```bash
git add scripts/health-check-runtime.js
git commit -m "fix(scripts): health-check が共有 fonts をアプリ扱いしないようにする"
```

---

### Task 2: Storybook story ID の衝突を解消する

**Files:**
- Create: `scripts/codemods/fix-story-titles.js`
- Modify: `apps/*/src/**/*.stories.tsx`（813ファイル）

**Interfaces:**
- Produces: 各 story の `title` が `<app-name>/UI/<Component>` 形式になり、
  Storybook が duplicate story IDs なしで起動する状態

- [ ] **Step 1: 衝突の実態を確認する**

```bash
grep -rh "title:" apps/aes-encrypt/src/components/ui/button.stories.tsx apps/bmi-calculator/src/components/ui/button.stories.tsx
```
Expected: どちらも `title: 'UI/Button',`（同一 = 衝突の原因）

- [ ] **Step 2: codemod を書く**

`scripts/codemods/fix-story-titles.js`:

```js
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { globSync } from "node:fs";

// stories の title をアプリ名で名前空間化する。
// Storybook の story ID は title から導出されるため、346 アプリで同じ 'UI/Button' が
// 衝突して起動できなくなっていた。
const TITLE_RE = /title:\s*(['"])((?:(?!\1).)*)\1/;

export function namespaceTitle(source, appName) {
  const m = source.match(TITLE_RE);
  if (!m) return { changed: false, source };
  const current = m[2];
  if (current.startsWith(`${appName}/`)) return { changed: false, source };
  const quote = m[1];
  const replaced = source.replace(
    TITLE_RE,
    `title: ${quote}${appName}/${current}${quote}`,
  );
  return { changed: true, source: replaced };
}

function main() {
  const files = globSync("apps/*/src/**/*.stories.tsx");
  let changed = 0;
  for (const file of files) {
    const appName = file.split(path.sep)[1];
    const original = readFileSync(file, "utf8");
    const result = namespaceTitle(original, appName);
    if (result.changed) {
      writeFileSync(file, result.source);
      changed++;
    }
  }
  console.log(`${changed} / ${files.length} ファイルの title を名前空間化しました`);
  if (files.length === 0) {
    console.error("stories ファイルが 1 つも見つかりません");
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith("fix-story-titles.js")) {
  main();
}
```

- [ ] **Step 3: 変換ロジックのテストを書く**

`scripts/__tests__/fixStoryTitles.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { namespaceTitle } from "../codemods/fix-story-titles.js";

describe("namespaceTitle", () => {
  it("title にアプリ名の名前空間を付ける", () => {
    const src = `const meta = {\n  title: 'UI/Button',\n  component: Button,\n};`;
    const r = namespaceTitle(src, "aes-encrypt");
    expect(r.changed).toBe(true);
    expect(r.source).toContain("title: 'aes-encrypt/UI/Button'");
  });

  it("既に名前空間化済みなら変更しない（冪等）", () => {
    const src = `title: 'aes-encrypt/UI/Button',`;
    const r = namespaceTitle(src, "aes-encrypt");
    expect(r.changed).toBe(false);
    expect(r.source).toBe(src);
  });

  it("ダブルクォートも扱える", () => {
    const src = `title: "UI/Card",`;
    const r = namespaceTitle(src, "bmi-calculator");
    expect(r.source).toContain(`title: "bmi-calculator/UI/Card"`);
  });

  it("title が無いファイルは変更しない", () => {
    const src = `export const Default = {};`;
    expect(namespaceTitle(src, "x").changed).toBe(false);
  });
});
```

- [ ] **Step 4: テストを実行**

```bash
pnpm exec vp test scripts/__tests__/fixStoryTitles.test.ts
```
Expected: 4 tests PASS

- [ ] **Step 5: codemod を実行**

```bash
node scripts/codemods/fix-story-titles.js
```
Expected: 800前後 / 813 ファイルが変更される（実測値を記録）

冪等性を確認する（2回目は 0 件になること）:

```bash
node scripts/codemods/fix-story-titles.js
```
Expected: `0 / 813`

- [ ] **Step 6: Storybook が起動することを確認**

```bash
pnpm storybook
```

**起動ログが示すポートの実値を読む**。duplicate story IDs のエラーが出ずに起動し、
サイドバーにアプリ名でグループ化された story が並ぶことを目視で確認する。
`url-encoder` の Select story を開き、**クリックして開閉が動作する**ことまで確認する
（パイロットで実測できなかった項目）。確認後、Storybook を停止する。

起動しない場合は**止めて報告**（衝突以外の原因がある）。

- [ ] **Step 7: commit**

```bash
git add scripts/codemods/fix-story-titles.js scripts/__tests__/fixStoryTitles.test.ts apps
git commit -m "fix(storybook): story title をアプリ名で名前空間化し ID 衝突を解消"
```

---

### Task 3: 移行 codemod を書く（カナリア1アプリで検証）

**Files:**
- Create: `scripts/codemods/migrate-to-elchika-ui.js`
- Test: `scripts/__tests__/migrateToElchikaUi.test.ts`
- Modify: `apps/aspect-ratio-calculator/**`（カナリア）

**Interfaces:**
- Produces: `node scripts/codemods/migrate-to-elchika-ui.js <app-name>` が
  1アプリを移行する。引数なしなら全アプリ（`home` と `url-encoder` を除く）

カナリアに `aspect-ratio-calculator` を使う理由: App 本体で Select を使い（開閉の
目視ができる）、コンポーネント7個の標準構成で、toast を4箇所使い、テストもある。

- [ ] **Step 1: toast 変換ロジックのテストを書く**

`scripts/__tests__/migrateToElchikaUi.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { transformToastCalls } from "../codemods/migrate-to-elchika-ui.js";

describe("transformToastCalls", () => {
  it("title のみの呼び出しを toast.add へ変換する", () => {
    const src = `toast({ title: "Copied!" });`;
    expect(transformToastCalls(src)).toContain(`toast.add({ title: "Copied!" })`);
  });

  it('variant: "destructive" を type: "error" へ変換する', () => {
    const src = `toast({ title: "Failed", variant: "destructive" });`;
    const out = transformToastCalls(src);
    expect(out).toContain(`type: "error"`);
    expect(out).not.toContain("variant");
  });

  it('variant: "success" を type: "success" へ変換する', () => {
    const src = `toast({ title: "OK", variant: "success" });`;
    expect(transformToastCalls(src)).toContain(`type: "success"`);
  });

  it("description は保持する", () => {
    const src = `toast({ title: "A", description: "B", variant: "destructive" });`;
    const out = transformToastCalls(src);
    expect(out).toContain(`description: "B"`);
    expect(out).toContain(`type: "error"`);
  });

  it("日本語文字列内のコロンを壊さない", () => {
    const src = `toast({ title: "エラー: 変換に失敗", variant: "destructive" });`;
    const out = transformToastCalls(src);
    expect(out).toContain(`title: "エラー: 変換に失敗"`);
    expect(out).toContain(`type: "error"`);
  });

  it("複数行の呼び出しを扱える", () => {
    const src = `toast({\n  title: "A",\n  description: "B",\n  variant: "destructive",\n});`;
    const out = transformToastCalls(src);
    expect(out).toContain(`type: "error"`);
    expect(out).not.toContain("variant");
  });

  it("useToast の分割代入と import を除去する", () => {
    const src = `import { useToast } from "@/hooks/useToast";\nconst { toast } = useToast();\ntoast({ title: "x" });`;
    const out = transformToastCalls(src);
    expect(out).not.toContain("useToast");
    expect(out).not.toContain("const { toast } =");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm exec vp test scripts/__tests__/migrateToElchikaUi.test.ts
```
Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: codemod を実装**

`scripts/codemods/migrate-to-elchika-ui.js` を作る。**toast の変換は ts-morph による
AST 操作で行う（MUST）**。regex では日本語文字列内のコロンを誤検出して 333 アプリの
コードを壊す（司令塔が実測で確認済み）。

ts-morph を devDependency に追加する:

```bash
pnpm add -D -w ts-morph
```

実装する処理:

1. **コンポーネント置換**: `apps/url-encoder/src/components/ui/<name>.tsx` を
   対象アプリの同名パスへコピーする（対象アプリが持つコンポーネントのみ）。
   `toaster.tsx` は elchika-ui に対応物が無いので**削除**する。
   url-encoder に無いコンポーネント（textarea / switch / slider）を持つアプリは
   そのコンポーネントを**変更せず残し**、対象アプリ名を「要個別処理」として出力する
2. **lib/utils.ts**: 対象アプリに無ければ url-encoder のものをコピーする
3. **トークン切替**: `src/index.css` を `@import "@tools/design-tokens-elchika";` の1行にする
4. **index.html**: `</head>` の直前に
   `    <link rel="stylesheet" href="/fonts/fonts.css" />` を追加する（既にあれば何もしない）
5. **dev 用リンク**: `apps/<app>/public/fonts` を
   `../../../packages/router/public/fonts` へのシンボリックリンクとして作る
6. **package.json**: `@radix-ui/*` と `@tools/design-tokens` を削除し、
   `@base-ui/react` `^1.7.0` / `@tools/design-tokens-elchika` `workspace:*` /
   `tw-animate-css` `^1.4.0` を追加する。バージョンは
   `apps/url-encoder/package.json` の実値に合わせる（読み取って使う）
7. **toast 変換**: `transformToastCalls` を `src/**/*.tsx`（stories と __tests__ を除く）へ適用し、
   `src/hooks/useToast.ts` と `src/components/ui/toaster.tsx` を削除する。
   `<Toaster />` を `<ToastToaster>` でルートを包む形へ書き換える
8. 各アプリの処理結果（成功 / 要個別処理とその理由）を stdout に列挙する。
   **サイレントな skip をしない**

`transformToastCalls(source: string): string` を export し、Step 1 のテスト対象にする。

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm exec vp test scripts/__tests__/migrateToElchikaUi.test.ts
```
Expected: 7 tests PASS

- [ ] **Step 5: カナリア1アプリへ適用**

```bash
node scripts/codemods/migrate-to-elchika-ui.js aspect-ratio-calculator
```

```bash
pnpm install
```

- [ ] **Step 6: カナリアの検証**

各コマンドを単独実行する:

```bash
pnpm exec vp test apps/aspect-ratio-calculator
```
Expected: exit 0

```bash
cd apps/aspect-ratio-calculator
pnpm run build
```
Expected: exit 0

```bash
node -e "const fs=require('fs');const d='dist/assets';const f=fs.readdirSync(d);const s=f.reduce((a,x)=>a+fs.statSync(d+'/'+x).size,0);console.log(f.length+' ファイル / '+(s/1024/1024).toFixed(2)+' MB')"
```
Expected: 1MB 未満（url-encoder は 0.30MB）

```bash
grep -r "fonts.googleapis" dist
```
Expected: 0 件（exit 1）

```bash
grep -rn "@radix-ui" src
```
Expected: 0 件（exit 1）

- [ ] **Step 7: カナリアの目視動作確認**

```bash
cd apps/aspect-ratio-calculator
pnpm run dev
```

**起動ログのポート実値を読む**。ブラウザで開き、次を**操作して反応するところまで**確認する:

- Select を開いて項目を選ぶ → 値が反映される
- toast が出る操作（コピー等）→ toast が表示される
- 失敗系の操作 → destructive 系の toast が表示される
- DevTools で `document.documentElement.dataset.theme = 'dark'` → 背景・文字色が dark になる
- `document.documentElement.dataset.theme = 'light'` → light に戻る
- `document.fonts.check("16px 'IBM Plex Sans JP'")` が `true`
- console に error / warn が出ていない

いずれかが動作しない場合は**止めて報告**。

- [ ] **Step 8: commit**

```bash
pnpm exec vp check scripts/codemods/migrate-to-elchika-ui.js scripts/__tests__/migrateToElchikaUi.test.ts
```

```bash
git add scripts/codemods/migrate-to-elchika-ui.js scripts/__tests__/migrateToElchikaUi.test.ts apps/aspect-ratio-calculator package.json pnpm-lock.yaml .gitignore
git commit -m "feat(codemod): elchika-ui 移行スクリプトを追加しカナリア1アプリを移行"
```

---

### Task 4: 外れ値アプリで dry-run

**Files:**
- Modify: 下記10アプリ

309アプリはテンプレ同型のため素直に通るが、壊れるのは分布の端に集中する。
**次の10アプリを先に処理して期待値を確定する**（司令塔が実測で選定）:

- コンポーネント4個: `bmi-calculator` / `savings-calculator`
- コンポーネント9個: `text-diff-checker`
- コンポーネント8個 + 少数派持ち: `ascii-chart` / `chart-builder` / `er-diagram`
- 少数派コンポーネント持ち: `image-transparent`（switch）/ `text-counter`（textarea）/
  `text-deduplicate`（textarea）/ `treemap-generator`（slider）

- [ ] **Step 1: 10アプリへ適用**

```bash
node scripts/codemods/migrate-to-elchika-ui.js bmi-calculator savings-calculator text-diff-checker ascii-chart chart-builder er-diagram image-transparent text-counter text-deduplicate treemap-generator
```

出力の「要個別処理」リストを記録する。

```bash
pnpm install
```

- [ ] **Step 2: 10アプリのテストとビルド**

```bash
pnpm exec vp test apps/bmi-calculator apps/savings-calculator apps/text-diff-checker apps/ascii-chart apps/chart-builder apps/er-diagram apps/image-transparent apps/text-counter apps/text-deduplicate apps/treemap-generator
```
Expected: exit 0。失敗したアプリ名と理由を記録する

各アプリを個別にビルドする（1つずつ実行し、失敗したものを記録）:

```bash
pnpm --filter bmi-calculator build
```

（`build` の filter 実行は正しい。`test` だけが filter 不可）

- [ ] **Step 3: 失敗分を修正**

失敗したアプリを個別に直す。**修正パターンが codemod に還元できるものは codemod 側を直す**
（同じ問題が残り335アプリで再発するため）。1アプリ固有の事情なら個別修正し、その旨を記録する。

修正後に Step 2 を再実行し、10アプリすべてが PASS することを確認する。

- [ ] **Step 4: commit**

```bash
git add scripts/codemods apps package.json pnpm-lock.yaml
git commit -m "feat(codemod): 外れ値10アプリを移行し codemod の穴を塞ぐ"
```

---

### Task 5: 残り全アプリへ一括適用

**Files:**
- Modify: 残り約334アプリ

- [ ] **Step 1: 全アプリへ適用**

```bash
node scripts/codemods/migrate-to-elchika-ui.js
```

（引数なし = `home` と処理済みアプリを除く全件。冪等なので処理済みは skip される）

出力の「要個別処理」リストを記録する。

```bash
pnpm install
```

- [ ] **Step 2: syntax-highlight を個別処理**

`syntax-highlight` は唯一 `.dark` クラス駆動の切替機構を持つ（司令塔が実測）。
elchika-ui は `data-theme="dark"` 駆動のため、切替コードを書き換える:

```bash
grep -rn "classList" apps/syntax-highlight/src
```

で該当箇所を特定し、`document.documentElement.classList.add/remove/toggle("dark")` を
`document.documentElement.dataset.theme = "dark" / "light"` 相当へ書き換える。
書き換え後、**dev サーバーで dark/light 切替が実際に動作すること**を目視確認する。

- [ ] **Step 3: 全アプリのテスト**

リポジトリルートで:

```bash
pnpm exec vp test
```

Expected: **失敗がベースライン（12 files / 7 tests）と同一以下**。
新規失敗が出たアプリを列挙し、1つずつ直す。
**テストの削除だけで通さない**（既存のテスト観点を保持する）。

- [ ] **Step 4: 全アプリのビルド**

```bash
bash scripts/build-all.sh
```
Expected: exit 0、346アプリすべてビルド成功

失敗したアプリを個別に直し、再実行する。

- [ ] **Step 5: アセットパス検査**

```bash
node scripts/check-asset-paths.js
```
Expected: exit 0（vite.config 346/346、ビルド成果物 違反0件）

- [ ] **Step 6: サイズ確認**

```bash
du -sh packages/router/public
```
Expected: **200MB 未満**（PR1 時点で 160MB。1アプリのサイズが旧方式とほぼ同等のため
大きくは増えないはず）。大きく超えた場合は内訳を調べて報告する

```bash
node -e "const fs=require('fs');const dirs=fs.readdirSync('packages/router/public',{withFileTypes:true}).filter(d=>d.isDirectory()&&d.name!=='fonts');const bad=dirs.filter(d=>fs.existsSync('packages/router/public/'+d.name+'/fonts'));console.log('fonts が混入したアプリ: '+bad.length+(bad.length?' -> '+bad.map(d=>d.name).join(','):''))"
```
Expected: 0（`build-all.sh` の除外が全アプリで効いていることの確認）

- [ ] **Step 7: commit（src と生成物を分ける）**

```bash
git add apps scripts package.json pnpm-lock.yaml .gitignore
git commit -m "feat: 全アプリを elchika-inc/ui へ移行"
```

```bash
git add packages/router/public
git commit -m "build(router): 全アプリを elchika-ui 版で再生成"
```

---

### Task 6: 各アプリ CLAUDE.md の更新

**Files:**
- Create: `scripts/codemods/update-app-claude-md.js`
- Modify: `apps/*/CLAUDE.md`

陳腐化した記載を実態へ機械更新する。`apps/url-encoder/CLAUDE.md` が実例
（React 18 / bun / Biome / Vite 6 / Cloudflare Pages と書かれているが、実態は
React 19 / pnpm・vp / Oxlint・Oxfmt / Vite+ / Workers + Static Assets）。

- [ ] **Step 1: 陳腐化の実態を確認**

```bash
grep -rl "React 18\|bun run\|Biome\|Vite 6\|Cloudflare Pages\|Radix UI" apps/*/CLAUDE.md
```
対象ファイル数を記録する。

- [ ] **Step 2: 置換テーブルで codemod を書く**

`scripts/codemods/update-app-claude-md.js` に次の置換を実装する（純粋関数
`updateClaudeMd(source: string): string` を export する）:

| 変換前 | 変換後 |
|---|---|
| `React 18` | `React 19` |
| `Vite 6` | `Vite+ (Vite 8 + Rolldown)` |
| `Tailwind CSS 3.4` | `Tailwind CSS v4` |
| `shadcn/ui (Radix UI)` | `elchika-inc/ui (Base UI)` |
| `Cloudflare Pages` | `Cloudflare Workers + Static Assets` |
| `bun run dev` | `vp dev` |
| `bun run build` | `vp build` |
| `bun test` | `vp test` |
| `bun run deploy` | `bash scripts/build-all.sh` |
| `bun run lint` | `vp check` |
| `linter: Biome` | `linter/formatter: Oxlint + Oxfmt (vp check)` |
| `テスト: bun test` | `テスト: vp test` |

- [ ] **Step 3: テストを書いて実行**

`scripts/__tests__/updateAppClaudeMd.test.ts` に各置換を1件ずつ検証するテストを書く
（12ケース）。加えて冪等性（2回適用しても同じ）を検証する。

```bash
pnpm exec vp test scripts/__tests__/updateAppClaudeMd.test.ts
```
Expected: 全 PASS

- [ ] **Step 4: 適用して確認**

```bash
node scripts/codemods/update-app-claude-md.js
```

```bash
grep -rl "React 18\|bun run\|Biome\|Vite 6\|Cloudflare Pages" apps/*/CLAUDE.md
```
Expected: 0 件（exit 1）

**注意**: `*.md` は整形禁止のため `vp check` に渡さない。`git diff` の目視で確認する。

- [ ] **Step 5: commit**

```bash
git add scripts/codemods/update-app-claude-md.js scripts/__tests__/updateAppClaudeMd.test.ts apps
git commit -m "docs(apps): 各アプリ CLAUDE.md を現行スタックへ更新"
```

---

### Task 7: design-audit 違反の機械修正

**Files:**
- Create: `scripts/codemods/fix-design-audit.js`
- Modify: `apps/*/src/App.tsx`

ベースライン 1,161 件のうち、**DS-002（366件）と DS-009（181件）を機械修正する**。
**DS-004（577件）は機械化できる分のみ**扱い、残りは件数を報告する。

- [ ] **Step 1: ルール定義を読む**

```bash
grep -n -A4 "DS-002\|DS-004\|DS-009" .docs/DESIGN.md
```

DS-002 = header 内に「← Tools トップに戻る」リンク・h1・説明文を配置（MUST）
DS-009 = メインコンテンツを `mx-auto max-w-7xl`（または 6xl / 5xl）+ レスポンシブ padding で囲む
DS-004 = すべての色指定に shadcn CSS 変数トークンを使う。任意カラークラス直書き禁止

- [ ] **Step 2: DS-002 の修正を実装**

`url-encoder` を含む既に準拠しているアプリの header 実装を参照実装として読み、
同じ構造を欠落アプリへ挿入する:

```bash
grep -rn "Tools トップに戻る" apps/*/src/App.tsx > /tmp/backlink-impl.txt
head -3 /tmp/backlink-impl.txt
```

**参照実装が 1 つも見つからない場合は止めて報告**（挿入すべき正解の形が確定できない）。

- [ ] **Step 3: DS-009 の修正を実装**

コンテナクラスが無いアプリのメインコンテンツ要素へ `mx-auto max-w-6xl` +
レスポンシブ padding を付与する。既に `max-w-*` を持つ要素には触らない。

- [ ] **Step 4: DS-004 の機械化可能分を実装**

Tailwind の任意カラークラス（`bg-gray-900`・`text-slate-500` 等）のうち、
**トークンへの 1 対 1 対応が確定できるものだけ**を置換する。
対応表は `.docs/DESIGN.md` と `packages/design-tokens-elchika/tokens.css` の
セマンティックトークン一覧から作る。**判断が要るものは変換せず件数を数える**。

- [ ] **Step 5: 適用と実測**

```bash
node scripts/codemods/fix-design-audit.js
```
処理した件数とルール別内訳、DS-004 の未処理件数を stdout に出す。

```bash
node scripts/design-audit.js
```
Expected: 違反が **1,161 件から減少**していること。ルール別の残件数を記録する。

```bash
git checkout -- .docs/design-audit-result.json
```

- [ ] **Step 6: 全アプリのテストとビルドで回帰がないことを確認**

```bash
pnpm exec vp test
```
Expected: 失敗がベースライン（12 files / 7 tests）と同一以下

```bash
bash scripts/build-all.sh
```
Expected: exit 0

- [ ] **Step 7: commit**

```bash
git add scripts/codemods/fix-design-audit.js apps
git commit -m "fix(design): DS-002/DS-009 と機械化可能な DS-004 違反を修正"
```

```bash
git add packages/router/public
git commit -m "build(router): design-audit 修正を反映して再生成"
```

---

### Task 8: PR 作成

- [ ] **Step 1: 最終検証**

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
git push -u origin naoto24kawa/elchika-ui-rollout-pr2
```

```bash
gh pr create --repo elchika-inc/tools --title "feat: 全アプリを elchika-inc/ui へ移行（PR2）" --body "<下記を記載>"
```

PR 本文に含める: spec とこの計画へのパス / 下記 rubric 各項目の実測値 /
「要個別処理」となったアプリとその対応 / DS-004 の未処理件数 /
レビュー記録（ラウンド数・指摘・対応）/ 計画から逸れた変更の申告 / 実装担当: Codex /
**レビューは src 側の diff のみを対象とし、`packages/router/public/` は生成物である旨**の明記 /
「マージ・デプロイ・本番検証は司令塔が human 承認後に実施」の明記。

**worker はここで停止し、司令塔の完了ゲートを待つ。**

## PR2 の完了条件（rubric）

1. `pnpm install` 後の `pnpm exec vp test` の失敗が**ベースライン（12 files / 7 tests）と同一以下**。
   新規失敗が1件でもあれば未完了
2. `bash scripts/build-all.sh` が exit 0（346アプリすべてビルド成功）
3. `node scripts/check-asset-paths.js` が exit 0
4. `node scripts/health-check-runtime.js` が **346/346**（Task 1 の修正後）
5. `packages/router/public/` が **200MB 未満**
6. `packages/router/public/<app>/fonts` が**どのアプリにも存在しない**（共有配信の1セットのみ）
7. 全アプリの dist に `fonts.googleapis` が 0 件
8. `apps/*/src` に `@radix-ui` の参照が 0 件
9. `node scripts/design-audit.js` の違反が**1,161件から減少**（DS-004 残件は報告済みであること）
10. Storybook が起動し、Select story の**開閉が動作**する
11. カナリア（`aspect-ratio-calculator`）と `syntax-highlight` の**目視動作確認**
    （toast 表示・Select 開閉・dark 切替が操作して反応するところまで）
12. `apps/*/vite.config.ts` に差分が無い（346/346 が `base: './'` のまま）
13. デプロイ後（司令塔が実施）: `health-check-runtime.js` が 346/346、
    `https://tools.elchika.app/fonts/fonts.css` が 200 + `text/css`
