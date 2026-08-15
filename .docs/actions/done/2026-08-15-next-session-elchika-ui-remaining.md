---
trigger: next-session
created: 2026-08-09
autonomy: manual
---

# elchika-ui 展開の残件（PR #852〜#856 完了後）

2026-08-09 に PR1〜PR5（#852 / #853 / #854 / #855 / #856）をすべてマージ・本番反映済み。
health-check 346/346 正常。以下が残件。

## 1. DS-004 の残 538 件（最大の残件）

意味が一意な status 色のみ機械変換済み。残りは syntax/code/chart 系など
「意味を持つ色」で、機械変換すると配色が壊れる（syntax-highlight の実例あり）。
個別判断が必要。

## 2. DS-009 の受容済み違反 2 件

`note-pad` と `responsive-preview` は**意識的に除外**した。どちらも
「画面幅いっぱいを使うことが機能要件」のアプリで、幅制限を足すと機能が劣化する。

- note-pad: サイドバー + エディタの全画面 flex レイアウト（幅制限を持たないのが設計）
- responsive-preview: main が `max-w-[1600px]`。DS-009 の許容最大 7xl=1280px でも狭くなる

**対応漏れではない。** 直しに行くと機能を壊す。

## 3. DS-001 (29件) / DS-002 (2件) / DS-003 (8件)

未着手。DS-002 の2件は `home`（トップページ自身なのでバックリンク不要 / 固有ブランド見出し）
で、いずれも意図的。

## 4. ErrorNotifier のデッドコード削除の要否

`image-crop` / `image-grayscale` の `services/ErrorNotifier.ts` は利用箇所0件。
新 toast API へ移行済みだが削除は見送り。DI 抽象として意図的に置かれた可能性があるため要判断。

## 5. components.json の世代差

一部アプリに旧世代の `components.json` が残る（`tailwind.config.js` 参照、
`registries` フィールドなし）。shadcn CLI で新規コンポーネントを add するとき
`Unknown registry "@elchika"` で失敗する。PR4 では registry から直接取得して回避した。

## 6. テンプレートの既存整形不備

`templates/react-spa/` の `index.html` / `src/main.tsx` / `vite.config.ts` に
formatting issue がある（elchika-ui 移行前から存在）。新規生成アプリが最初から
lint 不合格になる。`vite.config.ts` は既存346アプリとの一貫性のため整形しない方針。

## 7. 【重要】vp check の整形実行による大規模汚染（再発防止）

PR5 で `pnpm exec vp check <177ファイル>`（`--fix` なし）の実行後、
**リポジトリ全体5,486件が formatter で書き換わる事故**が発生した
（apps 3666 / packages 694+358 / e2e 332 / docs / README.md まで波及）。
コミット前に検出し、`git checkout -- .` とパス限定 `git clean` で復旧済み。

**再発防止として確立した運用**:
- lint/type の検証は `pnpm exec vp check --no-fmt <パス>` のみを使う
  （`--no-fmt` は副作用を起こさないことを実行前後の `git status` 比較で確認済み）
- 大量ファイルを渡すコマンドは実行後に必ず `git status --porcelain` の件数を確認する

原因の完全な特定には至っていない（worker の実行履歴では `--fix` なし）。
`vp` のバージョン更新時に再現するか確認する価値がある。
