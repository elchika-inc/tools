<!-- review-cycle:start 2026-10-31-tools-des-wrong-key -->
## 2026-10-31 DES の誤鍵テストを安定させる

- **Cycle ID**: 2026-10-31-tools-des-wrong-key
- **対象 HEAD**: `0d6af0002fe1c54abe6cd96afa2ed41308e9809d` 上の未コミット差分。
- **対象**: `apps/des-encrypt/src/utils/__tests__/des.test.ts`
- **対象ファイル SHA-256**: `03a6832a8ae9fcde4d2a25c74c8a9f72f8f580f8c1eddaa89d4be64a20b14074`
- **R2 差分 SHA-256**: `789a7de7860b97884efb1747fb4220d4cabc41d2ab4906253beb242c5dc45006`
- **実装担当**: codex-tools-test-fixes
- **総ラウンド数**: 2（上限 2）
- **終了理由**: 全員 LGTM。R1 は flag 0、対象 TS の引用符を整形した後に R2 で最終差分を確認。
- **レンズ別 flag 件数**: R1・R2 とも Fresh Eyes 0 / Security 0 / Core Logic 0 / Tests 0 / Domain 0 / Ambiguity - / Altitude -。
- **確定した偽陽性**: なし（直近の完全なサイクル記録にも無し）。
- **判断レンズへの差し戻し**: なし。
- **ACCEPTED_RISKS**: 新規受容無し。
- **INSPECTION_STATUS**: flag 0、optional 1件: 誤鍵時に返る文字列そのものの固定。元の平文を復元しない契約を検査する現状を維持し、追加はしない。

### 成功基準とスコープ

[Issue #870](https://github.com/elchika-inc/tools/issues/870) と委任仕様 PR 1 が正本。変更前後で対象の同一コマンドを各 50 回以上実行し、変更後は失敗 0。対象 TS の check は exit 0。誤った期待による陽性対照が失敗し、復元後に成功する。独立 5 レンズの flag 0 と、PR の CI 成功を別々に確認する。
アプリ実装、依存、AES-GCM の振る舞い、配信成果物、宣言は変更しない。PR のマージ・verdict コメント・デプロイは担当範囲外。

### 原因と選択

変更前の 50 回中 29 回目で `wrong key fails` だけが `expected [Function] to throw an error` になった。
CryptoJS 4.2.0 の TripleDES は認証を行わず、PKCS#7 unpad は末尾 byte を長さから差し引く。誤鍵でも非空 UTF-8 になると desDecrypt は返却するため、必ず例外という期待は成立しない。
実 API の探索 270 回目で空白 1 文字を返す暗号文を確認した。固定暗号文の 3 例で空・不正 UTF-8・非空 UTF-8 を分け、正しい鍵で各 fixture を復号できることも確認する。既存の Vitest test.each で足り、自前機構や依存は不要。

### 環境と検証

Node v22.23.4 / pnpm 10.32.1 / vite-plus 0.1.24。以下の test/check は PATH の先頭を Node 22 の bin にして個別実行し、pipe・連結は使っていない。
初回の依存未導入による起動失敗は、pnpm install --frozen-lockfile（exit 0）で解消。既定の Node v26.12.1 では afterEach の localStorage.clear で全件失敗（50/50 回）し、テスト固有の不安定性とは区別した。Node 22 は CI と同じ major である。

| 検証 | コマンド | 結果 |
|---|---|---|
| 変更前 | `pnpm exec vp test --run apps/des-encrypt/src/utils/__tests__/des.test.ts` × 50 | 49 回 exit 0 / 1 回 exit 1。失敗回は 5 passed / 1 failed |
| 変更後 | 同上 × 50 | 全回 exit 0、各 8 passed、失敗 0 回 |
| 陽性対照 | 同上。非空 UTF-8 の not.toBe を toBe に一時変更 | exit 1、7 passed / 1 failed、expected ' ' to be 'secret data' |
| 復元後 | 同上。バックアップから byte 一致で復元 | exit 0、8 passed |
| 収束の対: test | `pnpm exec vp test --run apps/des-encrypt/src/utils/__tests__/des.test.ts` | exit 0、8 passed |
| 収束の対: check | `pnpm exec vp check apps/des-encrypt/src/utils/__tests__/des.test.ts` | exit 0、1 file、warnings/lint/type errors 0 |

チェックの初回は single quotes による整形エラーで exit 1。AGENTS.md の記載と実 formatter が矛盾するため司令塔へ ask し、「対象テストだけ実 formatter に従う、設定と宣言は変えない」と裁定された。対象だけ --fix（exit 0）して double quotes に統一。意味の変更は des.test.ts の 19〜33 行で、それ以外は引用符のみ。
テストした条件は正しい鍵・誤鍵・空・不正 UTF-8・非空 UTF-8。大規模入力・並行・時刻/地域・共有状態・UI/E2E はアプリ変更がないため追加しない。暗号の安全性全般は本修正の範囲外。

### 独立レビュー

実装者とは別の claude -p プロセス 1 名に、5 レンズを順番に適用させた。ツールと advisor を無効化した静的レビューであり、テスト実行や CI の確認は実装者が別途行う。
入力はレンズ指示、PR の意図、git diff -U20 origin/main、テスト対象実装の全文の順。R2 末尾に前回の結果を添え、Fresh Eyes 完成後にだけ参照させた。

```bash
wc -c <入力ファイル>
CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1 perl -e 'alarm shift @ARGV; exec @ARGV' 900 claude -p --safe-mode --tools "" --model sonnet < <入力ファイル>
```

| ラウンド | 入力 byte / wc exit | reviewer exit | flag | optional |
|---|---|---|---|---|
| R1 | 9256 / 0 | 0 | 0 | 1 |
| R2 | 10935 / 0 | 0 | 0 | 0（R1 の提案は記録済み） |

5 ブロックの存在・順序・結論・flag 件数を検査し、原文のまま保存した。打ち切り・再試行は無し。

### R1 原文

<<<LENS_FINDINGS role="fresh-eyes">>>
LGTM
変更は既存テスト 1 件を、固定暗号文を使う `test.each` 1 件と単体テスト 1 件に置き換えただけです。新しいヘルパー、モック、自前の乱数制御はなく、標準機能で足りる箇所に自前実装が入った形跡はありません。ランダム salt に依存する前提を、固定 fixture で消す方針は意図と一致します。アプリ実装、依存、他テストには触れておらず、許可範囲を守っています。確信度 80% 以上の flag はありません。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="security">>>
LGTM
fixture は `correct-key` と `wrong-key` というテスト用の固定文字列で暗号化した暗号文です。実在の秘密、認証情報、外部入力は含まれません。実行時の注入面、権限変更、外部送信もありません。認証なし暗号の限界を実装では直さず、テストで事実として固定しています。この PR の範囲に沿っており、セキュリティ上の flag はありません。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="core-logic">>>
LGTM
`desDecrypt` は、結果が空なら `Decryption failed` を投げ、不正 UTF-8 なら CryptoJS が投げる例外をそのまま伝えます。それ以外は文字列を返します。この 3 分岐を 3 つの fixture が 1 つずつ対応して検証しており、実装と整合しています。CryptoJS の OpenSSL 形式では、鍵導出が passphrase と暗号文先頭の salt から決定的に決まります。そのため固定暗号文なら結果は再現可能です。各 fixture は正しい鍵での復号が `secret data` になることも先に確認しており、fixture が壊れていても誤鍵の結果と取り違えません。base64 の長さは、`Salted__` 8 byte、salt 8 byte、暗号文 16 byte の計 32 byte に対応する 44 文字で、3 つとも一致します。flag はありません。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="tests">>>
LGTM／optional: 3 件目で誤鍵時の返り値そのものを固定すると、意図がより明確になる
テストは隔離されています。共有状態、時刻、乱数、並行に依存しないため、不安定さの原因だった salt の乱数が消えています。誤鍵の 3 結果（空、不正 UTF-8、非空 UTF-8）を網羅し、正しい鍵での復号も確認しています。修正した振る舞いに関わる条件は、テストと「外した条件と理由」で説明されています。`toThrow(message)` は例外の種類まで区別するので、取り違えも検出できます。
- optional: 3 件目は `not.toBe('secret data')` だけです。例外を出さない（必然的に非空である）ことを暗黙に確認していますが、誤鍵時の実際の返り値は固定していません。実測した値を `toBe` で固定すると、意図が明示されます。ただし CryptoJS の挙動に強く結びつくため、現状でも許容できます。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="domain">>>
LGTM
TripleDES は認証を持たず、CryptoJS の PKCS#7 unpad は末尾 byte の値だけ `sigBytes` を減らします。誤鍵でも例外にならず、空、不正 UTF-8、非空 UTF-8 のいずれかになるという前提は仕様どおりです。`Malformed UTF-8 data` は CryptoJS の `Utf8.stringify` が投げるメッセージで、PR が CryptoJS 4.2.0 前提としていることとも整合します。salt 付き OpenSSL 形式の暗号文は固定すれば決定的に復号されるため、fixture 方式は適切です。「誤鍵なら必ず例外」という誤った前提を外し、AES-GCM の誤鍵拒否は既存テストで維持しています。flag はありません。
<<<END_LENS_FINDINGS>>>

### R2 原文

<<<LENS_FINDINGS role="fresh-eyes">>>
LGTM
誤鍵の結果が「空文字」「不正 UTF-8」「非空 UTF-8」の 3 通りに分かれるという事実に合わせ、乱数 salt に依存するテストを固定暗号文へ置き換えています。既存の Vitest の `test.each` だけで足り、自前機構は追加していません。アプリ実装・依存・他テストにも触れておらず、過剰実装はありません。AES-GCM 側のテストは引用符の整形以外は同一です。引用符の変更は AGENTS.md との関係を司令塔が裁定済みのため、再検討しません。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="security">>>
LGTM
追加されたのはテスト内の固定文字列だけです。暗号文と鍵 `correct-key` / `wrong-key` はテスト専用のダミーで、実際の秘密情報ではありません。外部入力、ネットワーク、ファイル、権限に関わる経路はなく、注入の余地もありません。アプリ側の暗号の安全性（認証なしの TripleDES など）は PR の範囲外と明記されており、今回の差分が新たに弱めるものもありません。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="core-logic">>>
LGTM
実装 `desDecrypt` の分岐は、結果が空で暗号文が非空なら `Decryption failed`、CryptoJS の UTF-8 変換が失敗すれば `Malformed UTF-8 data`、それ以外は文字列を返す、の 3 つです。追加した 3 ケースはこれに 1 対 1 で対応しています。各 fixture は正しい鍵で `secret data` に戻ることを先に確認しており、暗号文の取り違えがあれば誤鍵側の検証より先に失敗します。非空 UTF-8 のケースは、例外が出ないことと平文が復元されないことを同時に固定しています。暗号文の長さも整合しています（Salted__ ヘッダ 8 バイト、salt 8 バイト、PKCS#7 で 16 バイトに詰めた本文で計 32 バイト。Base64 は 44 文字で末尾 `=` 1 つ）。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="tests">>>
LGTM
乱数・時刻・共有状態に依存しない固定 fixture なので、不安定さの原因が除かれています。変更前は 50 回中 1 回失敗でしたが、変更後は 50 回すべて成功と記録されています。`toThrow(message)` は部分一致でメッセージまで検証するため、別原因の例外で通ることはありません。陽性対照（`not.toBe` を `toBe` に変えると失敗）で、アサーションが実際に効いていることも確認済みです。修正した振る舞い（誤鍵の結果）に関わる条件は、正しい鍵・誤鍵・空の結果・不正 UTF-8・非空 UTF-8 がテストに入っています。大規模入力・並行・時刻/地域を外した理由もアプリ無変更として記載されています。非空 UTF-8 の戻り値そのものを固定しない点は、R1 で記録済みの判断なので再指摘しません。
<<<END_LENS_FINDINGS>>>

<<<LENS_FINDINGS role="domain">>>
LGTM
CryptoJS の TripleDES に文字列の鍵を渡すと OpenSSL 互換の形式になり、先頭は `Salted__`（Base64 で `U2FsdGVkX1`）に続く 8 バイトの salt です。fixture の先頭と長さはこれと一致しています。この形式は認証を行わず、誤鍵でも PKCS#7 の unpad は末尾 1 バイトの値だけで長さを引くため、空・不正 UTF-8・非空 UTF-8 のどれにもなり得ます。この説明は、PR にある実 API での探索結果とも矛盾しません。`Malformed UTF-8 data` は CryptoJS の `Utf8.stringify` が投げる文言です。fixture は salt を含むため鍵導出が決定的になり、再現性があります。
<<<END_LENS_FINDINGS>>>

<!-- review-cycle:end 2026-10-31-tools-des-wrong-key -->
