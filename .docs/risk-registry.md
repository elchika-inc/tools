# risk-registry

受容した指摘・緩和・逸脱の台帳。書式は standards `DOCS_OPS.md` §3「risk-registry.md の書式」に従う。
指摘は「修正」か「明示受容（`accepted` + `reason` + `anchor`）」でのみ消す。握りつぶし禁止。

## RISK-001: PR CI / Deploy の型検査を段階導入している（全体では 2017 件の型エラー）

- date: 2026-08-17
- confidence: high
- location: `.github/workflows/ci.yml` の `Typecheck` ステップ / `.github/workflows/deploy.yml` の `Typecheck` ステップ
- status: accepted
- reason: standards `DOCS_OPS.md` §6 は型検査を PR CI と Deploy の独立ステップとして MUST 化する一方、「既に型エラーを抱えているプロジェクトは段階導入してよい（MAY）。緩和の内容と解除条件を `.docs/risk-registry.md` に記録する（MUST）」と定める。2026-08-17 のローカル実測で `pnpm exec vp check --no-fmt --no-lint apps packages scripts e2e` は **exit 1 / `Found 2017 errors and 7620 warnings in 6515 files`（178.8 秒）** だった。全体を対象にすると CI が恒久赤になり、`merge_policy: auto-on-green` の条件1（品質 check が green であること）を原理的に満たせなくなる。緩和として対象を「常時検査する green なベースライン `packages/router/src`（実測 exit 0 / `Found no type errors in 4 files`）」＋「PR が変更したアプリの `src/`」に絞る。触ったアプリの型エラーはその PR で顕在化するため、被覆は boy scout rule で単調に広がる（縮まない）。Deploy 側は push イベントに PR の base が無いためベースラインのみを対象にする。
- 解除条件: `apps/` の型エラーが解消し、`pnpm exec vp check --no-fmt --no-lint apps packages scripts` が exit 0 になった時点で、両 workflow の対象をリポジトリ全体へ広げ、変更アプリ検出のステップを削除する。段階的には「型エラー0のアプリを常時対象へ追加していく」形でも解除に向かう。
- anchor: `ci.yml` の `Typecheck` ステップの `targets` に列挙された対象そのもの。対象を狭める変更（`packages/router/src` の削除・変更アプリ検出の削除）は当該ステップの diff に現れる。加えて、この緩和が実効であること自体は CI 実行時のステップログ（`型検査の対象: ...` の出力）で毎回観測でき、対象が空になれば `vp check` が `No files found to lint` で exit 1 になり緑にならない。

## RISK-002: PR CI / Deploy のユニットテストで既存の赤 12 ファイルを隔離している

- date: 2026-08-17
- confidence: high
- location: `.github/workflows/ci.yml` / `.github/workflows/deploy.yml` の `Unit test` ステップの `--exclude` 群
- status: accepted
- reason: PR CI 新設以前から `main` のユニットテストは赤である。2026-08-17 のローカル実測で `pnpm exec vp test --run` は **exit 1 / `Test Files 12 failed | 698 passed (710)` / `Tests 7 failed | 6894 passed | 5 skipped (6906)` / `Errors 1`**（75.2 秒）だった。赤のまま CI へ載せると条件1（green）を原理的に満たせず、`auto-on-green` が永久に発効しない。修正はアプリ実装への変更を伴い本 PR のスコープ外のため、**CI 側でだけ**除外する。root の `vite.config.ts` は変更していないので、ローカルの `pnpm exec vp test` はこれらを実行し続け、失敗は隠れない。隔離適用後の実測は **exit 0 / `Test Files 698 passed (698)` / `Tests 6827 passed (6827)`**（71.0 秒）。
- 隔離対象と原因（2026-08-17 実測）:

  | ファイル | 原因 |
  |---|---|
  | `apps/bcrypt-hash/src/utils/__tests__/bcryptHash.test.ts` | 収集エラー。`ESM integration proposal for Wasm is not supported currently`（`builtin:vite-wasm-fallback`） |
  | `apps/hash-crc32/src/utils/__tests__/crc32.test.ts` | 同上 |
  | `apps/hash-md5/src/utils/__tests__/md5.test.ts` | 同上 |
  | `apps/zip-creator/src/utils/__tests__/zipCreator.test.ts` | 収集エラー |
  | `apps/sql-playground/src/utils/__tests__/sqlEngine.test.ts` | `RuntimeError: Aborted(ENOENT: ... './sql-wasm.wasm')`（unhandled rejection を含む） |
  | `packages/mcp-server/src/__tests__/registry.test.ts` | `Failed to resolve import "../../apps/encode-base64-string/src/utils/base64.js"`（`registry.ts` の参照先が実在しない） |
  | `apps/file-rename-batch/src/utils/__tests__/rename.test.ts` | アサーション失敗2件（`applies sequential numbering` / `respects start number`） |
  | `apps/geo-distance/src/utils/__tests__/geoDistance.test.ts` | アサーション失敗（Tokyo–New York の距離） |
  | `apps/k8s-yaml-generator/src/utils/__tests__/k8sGenerator.test.ts` | アサーション失敗（`handles empty data`） |
  | `apps/markdown-to-slides/src/utils/__tests__/slideParser.test.ts` | アサーション失敗（`renders blockquotes`） |
  | `apps/nato-phonetic/src/utils/__tests__/nato.test.ts` | アサーション失敗（`getReferenceTable` の並び順） |
  | `packages/router/src/__tests__/index.test.ts` | アサーション失敗（`should return 404 for unknown paths`） |

- 解除条件: 各ファイルが `pnpm exec vp test --run <パス>` で exit 0 になった時点で、その1件を両 workflow の `--exclude` から外す。12 件すべてが外れた時点でこのエントリを `mitigated` にする。**このリストへの追加は CI の被覆の縮小にあたるため、追加する PR は同じ PR でこのエントリを更新する。**
- anchor: 両 workflow の `--exclude` 行そのもの（追加・削除が PR diff に現れる）。加えて、`--exclude` に書いたパスが実在しなくなった場合（ファイル名変更・削除）、そのパスは何も除外せず、対象テストが赤ければ CI が赤くなる（fail-closed。除外の取りこぼしが緑に化けることはない）。

## RISK-003: PR CI は変更されたアプリだけをビルドする（全 346 アプリのビルドを行わない）

- date: 2026-08-17
- confidence: medium
- location: `.github/workflows/ci.yml` の `Build changed apps` ステップ
- status: accepted
- reason: standards `DOCS_OPS.md` §6 の役割分担は PR CI に「型検査 + ビルド + ユニットテスト」を課すが、同節の基本方針は「CI が担うのは安く・決定的に落ちるチェックだけ」である。2026-08-17 のローカル実測で1アプリのビルド（`apps/url-encoder` で `pnpm run build`）は **exit 0 / real 3.11 秒**であり、346 アプリを直列にビルドすると約 18 分（GitHub-hosted runner ではさらに伸びる）になる。PR ごとにこの費用を払うのは基本方針に反する。加えて、本番へ配信されるのは**コミットされた** `packages/router/public/` であって CI のビルド産物ではない（`deploy.yml` はビルドを行わない）ため、全アプリをビルドしても配信物の正しさは担保されない。配信物側の担保は `Check asset paths` ステップ（`node scripts/check-asset-paths.js`、実測 exit 0 / real 0.14 秒）が担う。
- anchor: `ci.yml` の `Build changed apps` ステップのログが毎回「ビルドしたアプリ: N 件」を出力する（サイレントな打ち切りにしない）。ビルドが壊れたアプリが `main` へ入った場合は `scripts/build-all.sh` が `set -e` で停止し、デプロイ作業の時点で顕在化する。

## RISK-004: `merge_policy: auto-on-green` の採用で配信が人間の確認を経ずに起動しうる

- date: 2026-08-17
- confidence: high
- location: `AGENTS.md` の `merge_policy` / `.github/workflows/deploy.yml`
- status: accepted
- reason: `DOCS_OPS.md` §5 は「`auto-on-green` は auto-deploy を意味する」と明記する。当リポジトリは `main` push を起点に `packages/router` を Cloudflare Workers へ deploy するため、前提条件が揃った後はエージェントのマージがそのまま本番配信を起動する。346 アプリを1つの Workers プロジェクトで配信しているので、誤った成果物のマージは全ツールに同時に効く（過去に vite `base` の誤りで全アプリ白画面の事故が起きている。`.docs/ASSET_PATH_INCIDENT.md`）。それでも受容するのは、配信物が静的アセットのみで巻き戻しが再 deploy で足りること、および §5 の前提条件（required status check の green・レビューサイクル収束・ブラウザ検証証跡）が配信前のゲートとして機能するためである。緩和として、①`deploy.yml` へ型検査とユニットテストを追加し、CI が赤のまま配信される経路を塞いだ ②`ci.yml` にも `check-asset-paths` を置き、白画面事故の原因をマージ**前**に検出できるようにした（`deploy.yml` の同検査はマージ後にしか走らない）。
- anchor: 本番の実体を検査する `node scripts/health-check-runtime.js`（346 アプリの HTML を取得し、参照先の JS/CSS を実際に GET して 200 と content-type を確認する。結果は `.docs/health-check-result.json` に残る）。受容が破れた場合、この実行結果に 200 でないアプリが現れる。

## RISK-005: standards rev.75 §1「参照資料と要求事項の分離（MUST）」に未対応

- date: 2026-08-17
- confidence: medium
- location: `AGENTS.md` の `## Architecture` 節 / `.docs/` 配下
- status: accepted
- reason: rev.75 が新設した `DOCS_OPS.md` §1「参照資料と要求事項の分離（MUST）」は、層の宣言を `AGENTS.md` の **Architecture 表**（責務列に「時点に依存する観測記録」と書いた行）で行うことを求め、宣言が無いプロジェクトでは「同表に列挙された文書の本文だけを正本を置いてよい場所として扱う」と定める。当リポジトリの `## Architecture` 節はディレクトリツリーであって文書の表ではなく、`.docs/` 配下（`APP_TEMPLATE_GUIDE.md` / `DESIGN.md` / `DESIGN_SYSTEM.md` / `TESTING_GUIDE.md` / `E2E_TESTING.md` / `COMPONENT_PATTERNS.md` / `STORYBOOK.md` / `ASSET_PATH_INCIDENT.md` 等）に置かれた要求事項が §1 の適合判定（①正本の文書名と節番号を伴う参照形か ②参照先に対応規定が実在するか）を通るかは未確認である。本 PR は PR CI の新設と `merge_policy` の宣言を目的としており、`AGENTS.md` の構造改訂と `.docs/` 全文の棚卸しはスコープが別である。`standards_version` は「この版まで差分を確認した」を意味し（rev.71 で定義）、監査で検出したギャップが本エントリに記録されていれば版の更新を妨げない。
- 解除条件: `AGENTS.md` に文書単位の Architecture 表を新設し、`.docs/` 配下の各文書について §1 の①形式・②実体を判定して、要求事項の移設または正本ポインタの付与を完了した時点。
- anchor: standards `AUDIT.md` の §1 対応 checkpoint（`references` 層への要求事項混在を検査する目視 checkpoint）。次回の `standards-audit` 実行でこのギャップが再検出される。
