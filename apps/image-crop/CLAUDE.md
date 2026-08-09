# Image Crop

画像のトリミング。

## アーキテクチャ

- SPA: React 19 + TypeScript + Vite+ (Vite 8 + Rolldown)
- UI: Tailwind CSS v4 + elchika-inc/ui (Base UI)
- デプロイ: Cloudflare Workers + Static Assets
- 完全クライアントサイド処理(サーバー通信なし)

## 主要ファイル

- `src/App.tsx` - メインUI
- `src/utils/errorHandler.ts` - コアロジック
- `src/utils/imageCropper.ts` - コアロジック
- `src/utils/typeGuards.ts` - コアロジック
- `src/utils/coordinateConverter.ts` - コアロジック
- `src/utils/imageValidator.ts` - コアロジック
- `src/utils/unitConverter.ts` - コアロジック
- `src/utils/imageLoader.ts` - コアロジック
- `src/utils/formatters.ts` - コアロジック
- `src/utils/cropAdjuster.ts` - コアロジック

## コマンド

```bash
vp dev      # 開発サーバー
vp build    # ビルド
vp test         # テスト
bash scripts/build-all.sh   # デプロイ
```

## 規約

- パスエイリアス: `@/` = `src/`, `@components/`, `@utils/`, `@types/`, `@config/`, `@hooks/`, `@services/`
- ボタンには必ず `type="button"` を付与
- 非同期クリップボード操作は try/catch で囲む
- linter/formatter: Oxlint + Oxfmt (vp check) (`vp check`)
- テスト: vp test (`src/__tests__/`)
