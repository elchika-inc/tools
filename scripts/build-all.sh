#!/bin/bash
set -e

# Step -1: アセットパス整合性チェック(ビルド前ゲート)
# base が './' 以外だと、ビルドした瞬間に全アプリが白画面になる成果物ができあがる。
# ここで止めることで「壊れた成果物を作ってしまう」こと自体を防ぐ。
# 詳細: .docs/ASSET_PATH_INCIDENT.md
echo "Checking asset path configuration..."
node "$(dirname "$0")/check-asset-paths.js" --config-only

# Step 0: WASM ビルド(アプリビルドの前に)
if [ -d "packages/wasm-utils" ]; then
  echo "Building wasm-utils..."
  (cd packages/wasm-utils && pnpm run build)
fi

# Step 1: 各アプリビルド -> packages/router/public/ にコピー
#
# コピー先はアプリ単位で作り直す。cp だけだと、ファイル名ハッシュが変わった
# 旧アセットが消えずに堆積する(Tailwind v4 一括移行では v3 時代の 1390 ファイルが残った)。
# 配信されないが git 管理下と Static Assets に載り続けるため、毎回作り直す。
#
# rm はビルドの「後」に置くこと。set -e があるのでビルドが失敗すればここへ到達せず、
# 失敗したアプリの配信中ディレクトリを消してしまうことがない。
for app in apps/*/; do
  app_name=$(basename "$app")
  echo "Building $app_name..."
  (cd "$app" && pnpm run build)
  rm -rf "packages/router/public/$app_name"
  mkdir -p "packages/router/public/$app_name"
  cp -r "$app/dist/"* "packages/router/public/$app_name/"
  rm -rf "packages/router/public/$app_name/fonts"
  node "$(dirname "$0")/fix-font-link.js" "packages/router/public/$app_name"
done

echo "All apps built successfully!"
