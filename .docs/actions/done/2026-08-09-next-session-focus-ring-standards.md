---
trigger: next-session
created: 2026-07-29
autonomy: manual
---

# フォーカスリングが standards §5 と異なる（344 アプリ / SP3 と併せて実施）

`apps/*/src/components/ui/` の shadcn コンポーネントが v3 時代のフォーカスリング実装を持っており、
standards `DESIGN.md` §5 が SHOULD とする形と異なる。

## 実測

| 項目 | 現状 | standards §5 |
|---|---|---|
| 実装 | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | `focus-visible:ring-[3px] focus-visible:ring-ring` |
| 実 computed 外縁 | 4px（ring 2px + offset 2px） | 3px |
| 波及範囲 | `button.tsx` だけで **344 アプリ** | — |

対象コンポーネント（url-encoder で確認したもの）: `button` / `input` / `select` / `toast`、
および `App.tsx` の `textarea` 2 箇所。

## 現時点で修正していない理由

- standards §5 のフォーカスリングは **SHOULD** であり MUST ではない。
- 現状の 4px はフォーカスが**より目立つ**方向の逸脱であり、視認性の実害はない。
  「フォーカスが見えない」という a11y の問題は発生していない。
- SP1 のスコープは「実装方式の置換であり UI 再設計ではない」と spec に明記されており、
  フォーカスリングの変更はその境界の外にある。
- 1 アプリだけ直すと 345 アプリと不整合な 1 個ができるだけで、状態が悪化する。

## 実施のタイミング

**SP3（ThemeToggle の `packages/ui` 共通化）と併せて実施するのが自然。**

346 アプリがそれぞれ `components/ui/` のコピーを持つ現状では、同じ変更を 346 回配ることになる。
SP3 で共通コンポーネント化を進めるなら、そのタイミングで standards §5 の形に揃える方が
作業が 1 回で済む。

なお `.docs/plans/ui-commonization-design.md` に 328 アプリ分の shadcn コンポーネントを
`packages/ui` へ集約する先行設計があるが、実際に依存しているアプリは 3 個で展開されていない。
この件も併せて判断する必要がある。

## 併せて確認すること

`ring-offset-2` は `--background` を offset 色として使う（`ring-offset-background`）。
standards §5 は「`/50` 等の透明度合成は light 背景で非テキストコントラスト 3:1（WCAG 1.4.11）を割るため使わない」
と規定しているが、offset 方式そのものの是非には触れていない。
3px 化する際に offset を外すことで見え方がどう変わるか、light / dark 両方で確認すること。

## 検出の経緯

SP1 Task 4（light / dark 目視検証）で、G6 の「フォーカスリングが 3px で見える」という
成功基準に対し実測 4px で FAIL したことから判明した。
成功基準は「フォーカスリングが可視であること」へ訂正し、差異を実測値付きで記録して受容した。

- SP1 spec: `docs/superpowers/specs/2026-07-29-design-standards-adoption-design.md`
- 検証記録: `.docs/verification/2026-07-29-sp1-visual-check.md`
