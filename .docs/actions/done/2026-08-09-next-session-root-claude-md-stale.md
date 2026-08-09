---
trigger: next-session
created: 2026-08-09
autonomy: manual
---

# リポルート CLAUDE.md が elchika-ui 移行後の実態と食い違う（次セッションを誤導する）

2026-08-09 の elchika-ui 全アプリ展開（PR #852・#853）で 345 アプリが
Base UI + `@tools/design-tokens-elchika` + 共有フォント配信へ移行したが、
**リポルートの `CLAUDE.md` は旧構成のまま**。各アプリの CLAUDE.md は Task 6 で更新済み。

## 陳腐化している箇所（実測 2026-08-09）

| 行 | 現在の記述 | 実態 |
|---|---|---|
| 41 | `components/ui/  # shadcn/ui コンポーネント` | elchika-inc/ui（Base UI）由来 |
| 56 | `Tailwind CSS v4 + shadcn/ui (Radix UI)` | Tailwind CSS v4 + elchika-inc/ui (Base UI) |
| 57-58 | カラートークンは `@tools/design-tokens` の oklch 定義が唯一の正本 / `src/index.css` は `@import "@tools/design-tokens";` の1行 | 345 アプリは `@tools/design-tokens-elchika`（elchika-ui 配布の2層トークン）。旧パッケージを使うのは `home` のみ |
| 104 | UI コンポーネントは shadcn/ui を使用(Radix UI ベース) | elchika-inc/ui を使用（registry から取り込み） |
| 198 | 整形禁止ファイルに `packages/design-tokens/tokens.css` | `packages/design-tokens-elchika/` 配下も同様に整形禁止（upstream との drift 検知が壊れる） |

## 追記が必要な内容

- **フォントは共有配信**: `packages/router/public/fonts/` に1セット。各アプリの `index.html` が
  `<link rel="stylesheet" href="/fonts/fonts.css">` で参照する。`scripts/build-fonts.js` が生成
- **`base: './'` は HTML 内の絶対パスも相対化する**ため、`scripts/fix-font-link.js` が
  build 後に `/fonts/fonts.css` へ書き戻す（`build-all.sh` から呼ばれる）。
  共有資産を追加する際の再発点
- **dark モードは `data-theme="dark"` 駆動**（elchika-ui 仕様）。`.dark` クラス単独では切り替わらない
- 新規アプリ作成手順（`create-app.js`）が旧構成のままの可能性 → `next-session-elchika-ui-followup.md` の5番と重複

## 優先度

高。この記述を信じて作業すると、旧トークンパッケージへ import したり
Radix を追加したりする誤りが起きる。
