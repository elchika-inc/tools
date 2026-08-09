---
trigger: next-session
created: 2026-08-09
autonomy: manual
---

elchika-ui 展開の残件（PR #852・#853 完了後）

345アプリの移行は完了・本番反映済み（health-check 346/346）。以下が残件。

1. **DS-009 のルールと実態の乖離（181件・要ユーザー判断）**
   DESIGN.md の DS-009 は `max-w-5xl/6xl/7xl` のみを許すが、181アプリは
   `max-w-md/xl/2xl/3xl/4xl` を**意図的に**使っている（割り勘計算・色選択など狭い方が
   使いやすいツール）。max-w が皆無のアプリは0件。
   選択肢: (a) ルールを緩める（何らかの max-w + mx-auto で準拠）/ (b) 181アプリの幅を統一
   （UI が変わる）/ (c) 現状維持。Claude の見立ては (a)。

2. **DS-004 の残 538 件**
   意味が一意な status 色のみ機械変換済み。残りは syntax/code/chart 系など
   「意味を持つ色」で、機械変換すると配色が壊れる。個別判断が必要。

3. **home アプリの移行**
   button のみの特殊構成のため対象外とした。`@radix-ui/react-slot` を1件使うが
   package.json に依存宣言があり整合している（壊れてはいない）。

4. **ErrorNotifier のデッドコード削除の要否**
   image-crop / image-grayscale の `services/ErrorNotifier.ts` は利用箇所0件。
   今回は新 toast API へ移行したのみで削除は見送った。DI 抽象として意図的に
   置かれた可能性があるため、削除の要否は要判断。

5. **create-app スクリプト・テンプレートの elchika-ui 対応**
   新規アプリ生成が旧構成（shadcn/Radix + @tools/design-tokens）のままの可能性。
   要確認・対応。

6. **旧 `@tools/design-tokens` パッケージの扱い**
   home のみが使用。全アプリ移行後の廃止可否を判断する。
