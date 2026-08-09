# CO2 Footprint Calculator

CO2 排出量を計算・可視化するツール。

## アーキテクチャ

- SPA: React 19 + TypeScript + Vite
- UI: Tailwind CSS v4 + elchika-inc/ui (Base UI)
- デプロイ: Cloudflare Workers
- 完全クライアントサイド処理(サーバー通信なし)

## 主要ファイル

- `src/App.tsx` - メインUI
- `src/utils/co2Footprint.ts` - 計算ロジック

## コマンド

```bash
pnpm install     # 依存関係インストール
cd apps/co2-footprint && vp dev    # 開発サーバー
vp build         # ビルド
vp test          # テスト
```

## 規約

- パスエイリアス: `@/` = `src/`, `@components/`, `@utils/`, `@types/`, `@config/`, `@hooks/`, `@services/`
- ボタンには必ず `type="button"` を付与
- 非同期クリップボード操作は try/catch で囲む
- Linter/Formatter: Oxlint + Oxfmt (via `vp check`)
- テスト: Vitest (`src/utils/__tests__/`)
