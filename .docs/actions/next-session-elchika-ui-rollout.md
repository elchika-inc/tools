---
trigger: next-session
created: 2026-08-09
autonomy: manual
---

elchika-inc/ui の全アプリ展開（パイロット完了済み）

url-encoder パイロットは PR #851 でマージ・本番反映済み（spec: docs/superpowers/specs/2026-08-09-elchika-ui-pilot-design.md）。
残り 345 アプリへの展開サイクルを計画する際の論点:

1. **dark モードは data-theme="dark" 駆動**（elchika-ui 仕様）。旧 .dark クラス単独では切り替わらない。
   .dark 前提の切替機構を持つアプリは追随が必要
2. **CSS サイズが 31→566kB に増加**（IBM Plex セルフホストの unicode-range 定義。gzip 後は縮む）。
   346 アプリで許容するか、フォント共有配信を検討するか
3. **Storybook が duplicate story IDs で起動不能**（他アプリの同名 story と衝突）。展開前に解消が必要
4. Action Queue の focus-ring 項目（344 アプリ）は elchika-ui 移行で解消される見込み → 展開に統合
5. 各アプリの CLAUDE.md が陳腐化する（url-encoder/CLAUDE.md は移行前から React 18/bun/Biome 記載で古い）。
   展開時に一括更新を検討
6. 展開手順のテンプレは PR #851 の diff が実例（トークン import 1 行 + components.json + shadcn add + toast 書き換え）
