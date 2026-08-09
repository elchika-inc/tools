# Golden Ratio Calculator

黄金比・白銀比・各種比率から寸法を計算するツール。

## アーキテクチャ

- SPA: React 19 + TypeScript + Vite+
- UI: Tailwind CSS v4 + elchika-inc/ui (Base UI)
- デプロイ: Cloudflare Workers + Static Assets
- 完全クライアントサイド処理(サーバー通信なし)

## 主要ファイル

- `src/App.tsx` - メインUI
- `src/utils/goldenRatio.ts` - 比率定義・計算ロジック

## コマンド

```bash
vp dev     # 開発サーバー起動 (port 5457)
vp test    # ユニットテスト
vp check   # lint/format チェック
```

## 規約

- パスエイリアス: `@/` = `src/`, `@components/`, `@utils/`, `@types/`, `@config/`, `@hooks/`, `@services/`
- ボタンには必ず `type="button"` を付与
- 非同期クリップボード操作は try/catch で囲む
- テスト: `src/utils/__tests__/`
