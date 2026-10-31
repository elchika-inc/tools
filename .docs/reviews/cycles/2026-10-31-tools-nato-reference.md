<!-- review-cycle:start 2026-10-31-tools-nato-reference -->
## 2026-10-31 NATO 参照表テストの修正と隔離解除

- **Cycle ID**: 2026-10-31-tools-nato-reference
- **対象 HEAD**: `0d6af0002fe1c54abe6cd96afa2ed41308e9809d` 上の未コミット差分。
- **差分 SHA-256**: `b5c3e708f6a3d2a6a3bc1fcce8d20969f5cd69075c8a059ac6fae92be3445c9f`
- **実装担当**: codex-tools-test-fixes
- **総ラウンド数**: 1（上限 2）
- **終了理由**: 全員 LGTM。
- **レンズ別 flag 件数**: Fresh Eyes 0 / Security 0 / Core Logic 0 / Tests 0 / Domain 0 / Ambiguity - / Altitude -。
- **確定した偽陽性**: なし（直近の完全なサイクル記録にも無し）。
- **判断レンズへの差し戻し**: なし。
- **ACCEPTED_RISKS**: 新規受容無し。
- **INSPECTION_STATUS**: flag 0、optional 2件: 既存テスト名の英語との混在、参照表の中間要素の NATO 語の網羅。変更対象の並び順と境界は検査済みで、どちらも追加対応しない。

### 成功基準とスコープ

[Issue #871](https://github.com/elchika-inc/tools/issues/871) と委任仕様 PR 2 が正本。変更前の失敗、変更後の対象 test/check の exit 0、誤期待への陽性対照と復元、NATO の隔離 1 件だけの解除と現在件数の一致、独立 5 レンズ flag 0 を確認する。PR の範囲、#869 との非衝突、PR の CI 成功はコミット後に別途確認する。
アプリ実装・ほかのテストの隔離・配信成果物・宣言は変更しない。PR のマージ・verdict コメント・デプロイは担当範囲外。

### 対象と fingerprint

- `.docs/risk-registry.md`: SHA-256 `1acb6691a5b1e6a13dbda6e0773d301ac9a2edcde370c52c9b77de94a08b1f2e`
- `.github/workflows/ci.yml`: SHA-256 `213b7766799b0b6d90d2050ee61f255d17af14a3f727f0c75baa1084feeebbdf`
- `apps/nato-phonetic/src/utils/__tests__/nato.test.ts`: SHA-256 `eac9e70a5b3c69bc317f65e6b6178e08bc411780be2b082e961cde5bbbc5bbce`

### 原因と選択

getReferenceTable は Object.entries(NATO_ALPHABET) を map する。整数インデックスのキー 0〜9 が先に数値順で列挙されるため、先頭 A/Alfa の旧期待が実装と不一致だった。
全36キーの順序と 0・9・A・Z の境界の対応を検査する。アプリは変更せず、CI の除外 1 行と台帳の 1 行を削除し、現在件数を 11 にした。初回の実測値（12 failed 等）は歴史記録として保った。

### 環境と検証

Node v22.23.4 / pnpm 10.32.1 / vite-plus 0.1.24。test/check は PATH の先頭を Node 22 の bin にして個別実行し、pipe・連結は使っていない。既定 Node v26.12.1 の localStorage が共通 afterEach と衝突するため、CI と同じ 22 系へ実行環境だけを合わせた。

| 検証 | コマンド | 結果 |
|---|---|---|
| 変更前 | `pnpm exec vp test --run apps/nato-phonetic/src/utils/__tests__/nato.test.ts` | exit 1、9 passed / 1 failed、先頭 A/Alfa の期待に対し 0/Zero |
| 変更後 | 同上 | exit 0、10 passed |
| 陽性対照 | 同上。期待順序を英字先にし、小文字の入力を空文字に一時変更 | exit 1、8 passed / 2 failed。順序不一致と expected undefined to be Alfa を個別に観測 |
| 復元後 | 同上。バックアップから byte 一致で復元 | exit 0、10 passed |
| 収束の対: test | `pnpm exec vp test --run apps/nato-phonetic/src/utils/__tests__/nato.test.ts` | exit 0、10 passed |
| 収束の対: check | `pnpm exec vp check apps/nato-phonetic/src/utils/__tests__/nato.test.ts` | exit 0、1 file、warnings/lint/type errors 0 |
| 隔離リストと範囲 | Python で CI exclude と RISK-002 の表を抽出・集合比較し、変更前後の文字列を比較 | exit 0、11 件ずつ・同一集合、NATO 無し、他リスク節 byte 一致、workflow は指定 1 行のみ削除 |

初回 check --fix は既存アサーション6箇所の TS2532 により exit 1。司令塔へ ask し、テスト内だけ result[index]?.nato にする裁定を受領。要素欠落時は undefined と元の期待値の不一致で失敗するため、合否の意味は維持する。陽性対照でも確認した。
AGENTS.md の single quotes 記載と実 formatter の double quotes は矛盾するが、司令塔の裁定により対象テスト内だけ実 formatter に従う。設定と宣言は変えない。
意味の変更は nato.test.ts の 58〜65 行。型検査対応は 16・17・22・23・24・29 行。それ以外は引用符の整形のみ。
テストした条件は 36 件の量、全キーの順序、数字と英字の先頭・末尾。引数なしの静的表なので、不正入力・非同期失敗・時刻/地域・共有状態・並行・UI/E2E は追加しない。

### 独立レビュー

実装者とは別の claude -p プロセス 1 名に、5 レンズを順に適用させた。tools と advisor を無効化した静的レビューであり、テスト実行と CI の確認は実装者が別途行う。
入力はレンズ指示、PR の意図、git diff -U20 origin/main、テスト対象の実装全文の順。

```bash
wc -c <入力ファイル>
CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1 perl -e 'alarm shift @ARGV; exec @ARGV' 900 claude -p --safe-mode --tools "" --model sonnet < <入力ファイル>
```

R1: 入力 30634 bytes、wc exit 0、reviewer exit 0、flag 0、optional 2。
5 ブロックの存在・順序・結論・flag 件数を検査し、原文のまま保存した。打ち切り・再試行は無し。

### R1 原文

<<<LENS_FINDINGS role="fresh-eyes">>>
LGTM／optional: テスト名だけ日本語で、同ファイルの他の `it` は英語のまま。
差分は PR の意図（対象テストの期待修正、`ci.yml` の `--exclude` 1 行削除、RISK-002 の現在件数と行の更新）に収まっている。アプリ実装には触れていない。`getReferenceTable` の実装を直さず期待側を直す判断は、`Object.entries` の列挙順という実装の挙動に合っていて、過剰実装もない。自前実装へ降りた箇所は無いので flag 対象外。引用符の全面変更は、司令塔の裁定済みとして指摘しない。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="security">>>
LGTM
変更はテストコード、CI の除外引数の削除、台帳の文言だけである。注入・秘密・権限に関わる経路は追加されていない。`ci.yml` の変更は除外の 1 行削除のみで、シェル展開や権限設定への影響はない。隔離の解除は CI の被覆を広げる方向で、安全側の変更である。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="core-logic">>>
LGTM
- **列挙順:** `NATO_ALPHABET` のキー `'0'`〜`'9'` は整数インデックス形式の文字列キーである。ES2015 以降の `OrdinaryOwnPropertyKeys` では、これらが昇順で先に、残りの `A`〜`Z` が挿入順で後に列挙される。期待値の `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ`、`table[0]` が 0/Zero、`table[9]` が 9/Niner、`table[10]` が A/Alfa、`table[35]` が Z/Zulu は、実装と一致する。
- **`ci.yml`:** 削除した行は中間の行で、末尾の `packages/router/...` は元から `\` なしの最終行のため、継続行の構文は崩れていない。
- **台帳と CI の整合:** `ci.yml` の `--exclude` は、bcrypt、crc32、md5、zip、sql、mcp、rename、geo、k8s、markdown、router の 11 件。RISK-002 の表も同じ 11 件で、見出し、解除条件、緑化の検知経路の件数も 11 に揃っている。
- **履歴の保持:** 初回測定の 12 failed は改変されておらず、解除の追記が別行で入っているため、時系列の整合も保たれている。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="tests">>>
LGTM／optional: 中間要素（`table[1]`〜`[8]`、`[11]`〜`[34]`）の NATO 語は検証していない。
- **順序:** 全 36 キーの並びを文字列一括比較で固定している。長さ 36 の検証も残っており、欠落や重複、順序入れ替えは検出できる。
- **境界:** 数字と英字の境界（`[9]` と `[10]`）、先頭と末尾（`[0]` と `[35]`）を個別に検証している。
- **テスト間の隔離:** 引数なしの純粋関数で共有状態がなく、テスト間の依存はない。
- **`?.` への変更:** 要素が欠けると `undefined` と期待値の不一致で落ちる。陽性対照も実測済みで、検出力は保たれている。
- **外した条件:** 不正入力、非同期失敗、時刻・地域、並行は、対象が引数なしの静的表であるため PR 本文の理由が妥当。
- **optional の扱い:** 中間要素の NATO 語は変換テストが一部カバーしており、表の語そのものの網羅は今回の修正対象（並び順）の外にある。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="domain">>>
LGTM
- **綴り:** 期待値に使った Zero、Niner、Alfa、Zulu は、ICAO/NATO のスペリングアルファベットの正式な綴りである（Alfa、Juliett、Niner、X-ray 等）。
- **列挙順:** ECMAScript の仕様どおり、整数インデックス形式のキーが昇順で先に列挙され、文字列キーは挿入順で後になる。期待する並びはこの仕様に合っている。実装がこの順序に依存している点は、テスト名と期待値に明示されていて、仕様上も安定している。
<<<END_LENS_FINDINGS>>>

<!-- review-cycle:end 2026-10-31-tools-nato-reference -->
