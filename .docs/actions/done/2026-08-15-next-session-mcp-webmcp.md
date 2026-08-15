---
trigger: next-session
created: 2026-08-12
autonomy: manual
---

# MCP 公開の方針決め（既存 mcp-server のリモート化 / CF WebMCP）— ユーザー判断待ち

2026-08-12 にユーザーから「Cloudflare の WebMCP が気になる。ツール群のサイトなので
適してるのでは？」と相談があり、Claude が調査して選択肢を提示した。**方針は未決定で着手していない。**

## 調査でわかったこと（実測・出典あり）

**既に MCP サーバーが存在する**: `packages/mcp-server`
- `@modelcontextprotocol/sdk` を使い、224行の `registry.ts` で base64 / HTMLエンティティ /
  uuencode / JSON・XML・HTML・YAML整形 / TOML / Caesar・Atbash / UUID・ULID /
  ケース変換などを、各アプリの `src/utils/` から直接 import して公開
- ただし **transport が stdio**、**デプロイされていない**（`wrangler.toml` 無し、
  router のルーティングにも未登録）。今はローカルの Claude Code から使うだけ

**Cloudflare WebMCP**（<https://blog.cloudflare.com/webmcp/>）
- ブラウザ標準の API（Chrome 146 で実験配信、`document.modelContext`）
- Cloudflare 実装はダッシュボードのトグルのみ。HTML レスポンスにブリッジスクリプトを注入
- **コード変更・オリジン変更が不要**。ツールは「ツールパック」として**自動生成**
- デベロッパープレビュー段階

## Claude の見立て（未承認）

- **主軸は既存 mcp-server の Streamable HTTP 化 + Workers デプロイ**が本命。
  1エンドポイントで全ツールを提供でき、ページを開く必要がない。実装の大半が既にある
- **WebMCP はコストがほぼゼロ**（トグルのみ）なので排他ではなく併用可。
  ただし自動生成のツールパックが346個の固有機能を認識できるかは未検証
- 懸念: WebMCP は「ページを開いている状態」が前提。346ツールは別 URL なので
  エージェントが目的のページに辿り着く必要がある

## 次にやること

ユーザーがどちらから進めるかを決める。決まれば設計（brainstorming）から着手する。
