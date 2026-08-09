---
trigger: next-session
created: 2026-08-09
autonomy: manual
---

# フォーカスリング standards §5 — elchika-ui 移行で部分解消。残りは App.tsx 直書き分

2026-08-09 の elchika-ui 全アプリ展開（PR #853）で**コンポーネント側は解消済み**。
旧 action（2026-07-29 起票、344アプリ）を実測に基づき更新した。

## 解消した範囲（実測 2026-08-09）

- `apps/*/src/components/ui/button.tsx` は **345/346 が standards §5 準拠**
  （`focus-visible:ring-[3px] focus-visible:ring-ring`）。非準拠は移行対象外の `home` のみ
- `focus-visible:ring-*/50` 等の透明度合成は **0 件**
- button / input / select / toast は elchika-ui 版に置換され、配布実装が §5 に準拠している

## 残っている範囲（実測 2026-08-09）

`focus-visible:ring-offset-2`（旧 v3 実装）が **139 ファイルに残存**:

| 場所 | 件数 | 内容 |
|---|---|---|
| `App.tsx` | 127 | 直書きの `<textarea>` `<select>` 等。elchika-ui のコンポーネントを経由しないため移行対象外だった |
| `components/ui/textarea.tsx` | 10 | elchika-ui に置換していない少数派コンポーネント |
| `components/ui/button.tsx` | 1 | `home`（移行対象外） |
| その他 `components/` | 1 | — |

## 判断が必要なこと

1. **App.tsx 直書き分（127件）の扱い** — elchika-ui の Textarea / Native Select へ
   置き換えるか、クラス名だけ §5 の形に揃えるか
2. **textarea.tsx（10件）を elchika-ui 版へ移行するか**
   （registry に Textarea がある。slider/switch と同様の手順で可能）
3. standards §5 は **SHOULD** であり、現状の 4px はフォーカスがより目立つ方向の逸脱で
   視認性の実害はない（旧 action の判断を踏襲）

## 関連

- 旧 action: `.docs/actions/done/2026-08-09-next-session-focus-ring-standards.md`
- 展開の残件: `next-session-elchika-ui-followup.md`
