---
trigger: next-session
created: 2026-08-09
autonomy: manual
---

# 本番で JS が動かないアプリが2件ある（elchika-ui 移行前から。移行起因ではない）

2026-08-09、elchika-ui 移行完了後に**全346アプリを実ブラウザで開いて JS 実行を検証**したところ、
2件が異常だった。いずれも**移行前から壊れている**ことを実測で確認済み。

検証方法: Playwright で本番 URL を開き、`#root` の子要素数・innerHTML 長・console error を確認。
`scripts/health-check-runtime.js` は HTTP レベル（HTML と参照先の取得）までしか見ないため、
**「HTTP は 200 だが JS が落ちて何も描画されない」状態を検出できない**。今回はそこを埋めた。

## 1. morpheme-analyzer — 完全な白画面

```
TypeError: Cannot use 'in' operator to search for 'Zlib' in undefined
```

`#root` の子要素 0 / innerHTML 0 バイト。**何も描画されない。**

原因: `kuromoji`（形態素解析）が辞書解凍に使う Zlib のグローバルを解決できない。
Node 向けライブラリをブラウザで使うときの典型的な問題で、UI 移行とは無関係。

**移行前から壊れていることの実測**: `git archive 570ec3e6`（PR #851 の直前）で
移行前の成果物を取り出しローカル配信して開いたところ、**同じ Zlib エラーで
`#root` の子要素 0 / innerHTML 0**。移行起因ではないと確定。

## 2. sql-playground — DB 初期化に失敗

```
wasm streaming compile failed: HTTP status code is not ok
Failed to initialize database: Error: both async and sync fetching of the wasm failed
```

画面は出るが SQL 実行ができない。

原因: コードは `sql-wasm-browser.wasm` を `locateFile: e => './' + e` で探すが、
配置されているのは **`sql-wasm.wasm`**（ファイル名の不一致）。
`https://tools.elchika.app/sql-playground/sql-wasm.wasm` は 200 で返るが、
実際に要求される `sql-wasm-browser.wasm` が無い。

**移行前から同じ構成**（`git ls-tree 570ec3e6` で `sql-wasm.wasm` のみを確認）。
ベースラインのユニットテスト失敗リストにも `sql-playground`
（`ENOENT: './sql-wasm.wasm'`）が含まれており、以前から認識されていた不具合。

## 対応の方向

- morpheme-analyzer: kuromoji のブラウザ向け設定（Zlib の polyfill / bundler 設定）を見直す
- sql-playground: `sql.js` のバージョンに合った wasm ファイル名を配置するか `locateFile` を修正する

## 併せて検討したいこと

`scripts/health-check-runtime.js` に**実ブラウザでの描画確認**を足すと、この種の
「HTTP は通るが動かない」を継続的に検出できる。今回使った検証スクリプトの要点:
Playwright で開き、`#root` の子要素数と innerHTML 長、`pageerror` を見る
（favicon の 404 は全アプリ共通なので除外する）。346アプリを並列8で約5分。
