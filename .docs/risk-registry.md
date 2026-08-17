# risk-registry

受容した指摘・緩和・逸脱の台帳。書式は standards `DOCS_OPS.md` §3「risk-registry.md の書式」に従う。
指摘は「修正」か「明示受容（`accepted` + `reason` + `anchor`）」でのみ消す。握りつぶし禁止。

**この台帳が緩和内容の正本である。** `AGENTS.md` と `.github/workflows/*.yml` のコメントは要約とポインタであり、
食い違ったときはこの台帳が勝つ。

**再評価の契機（横断）**: 次のいずれかのタイミングで、`status: accepted` の全エントリの解除条件を評価する。
①`standards_version` を更新する PR ②`standards-audit` スキルの実行時 ③当該エントリの `location` に挙げたファイルを変更する PR。

## RISK-001: PR CI / Deploy の型検査を段階導入している（全体では 2017 件の型エラー）

- date: 2026-08-17
- confidence: high
- location: `.github/workflows/ci.yml` の `Typecheck` ステップ / `.github/workflows/deploy.yml` の `Typecheck` ステップ
- status: accepted
- reason: standards `DOCS_OPS.md` §6 は型検査を PR CI と Deploy の独立ステップとして MUST 化する一方、「既に型エラーを抱えているプロジェクトは段階導入してよい（MAY）。緩和の内容と解除条件を `.docs/risk-registry.md` に記録する（MUST）」と定める。2026-08-17 のローカル実測で `pnpm exec vp check --no-fmt --no-lint apps packages scripts e2e` は **exit 1 / `Found 2017 errors and 7620 warnings in 6515 files`（178.8 秒）** だった。全体を対象にすると CI が恒久赤になり、`merge_policy: auto-on-green` の条件1（品質 check が green であること）を原理的に満たせなくなる。緩和として対象を「常時検査する green なベースライン `packages/router/src`（実測 exit 0 / `Found no type errors in 4 files`）」＋「PR が変更した TypeScript ファイル**そのもの**」に絞る。Deploy 側は push イベントに PR の base が無いためベースラインのみを対象にする。
- **粒度をファイル単位にした理由（実測）**: 当初はアプリの `src/` ディレクトリ単位にしていたが、レビューでの実測（意図的サンプル5件 + 系統サンプル16件 = **21/21 が exit 1**）により、ディレクトリ単位では**アプリを1行でも触る PR がほぼ必ず赤**になり、緩和の目的（恒久赤の回避）が達成できないことが判明した。エラーは `src/__tests__/` や `src/components/` にも散っており、`src/utils/foo.ts` を1行直す PR まで巻き込む。ファイル単位に改めた後の実測: 型エラーを持つファイルは **6515 中 853 件（約13%、うち `__tests__` 配下は186件）**。`apps/*/src/App.tsx` のサンプル7件では **3件が exit 1（4件が exit 0）** で、App.tsx は平均より密度が高い。
- **残る赤への対処（判断がばらつかないように明記する）**: この緩和の下でも、既存の型エラーを持つファイルを触る PR は赤になる。赤は「触ったファイル自身の型エラー」に限られ、これは boy scout rule として意図した挙動である。赤になった PR が取るべき選択肢は次の3つで、**この順に検討する**。①そのファイルの型エラーを同じ PR で直す（既定。被覆が広がる）②型エラーの修正が本題と混ざって PR が読めなくなる規模なら、修正を先行 PR に分ける ③どちらも成立しない事情があるなら、このエントリへ当該ファイルを個別に受容として追記する（テスト側の隔離リストに相当する逃げ道。**追記する PR は理由と解除条件を必ず書く**）。**現時点で個別受容しているファイルは無い。**
- 解除条件: `pnpm exec vp check --no-fmt --no-lint apps packages scripts e2e`（**`reason` の実測と同一の引数**）が exit 0 になった時点で、両 workflow の対象をこの引数の集合へ広げ、変更検出のステップを削除して本エントリを `mitigated` にする。段階的には「型エラー0のアプリを `Typecheck` の常時対象へ追加していく」形でも解除に向かう。
- anchor: `ci.yml` の `Typecheck` ステップの `targets` に列挙された対象そのもの。対象を狭める変更（`packages/router/src` の削除・変更検出の削除）は当該ステップの diff に現れる。加えて、実際に何を検査したかは CI 実行時のステップログ（`型検査の対象: ...` の出力）と `vp check` の集計行（`Found no type errors in N files`）に毎回残るため、対象が縮んだことをログの実測値で確認できる。

## RISK-002: PR CI / Deploy のユニットテストで既存の赤 12 ファイルを隔離している

- date: 2026-08-17
- confidence: high
- location: `.github/workflows/ci.yml` / `.github/workflows/deploy.yml` の `Unit test` ステップの `--exclude` 群
- status: accepted
- reason: PR CI 新設以前から `main` のユニットテストは赤である。2026-08-17 のローカル実測で `pnpm exec vp test --run` は **exit 1 / `Test Files 12 failed | 698 passed (710)` / `Tests 7 failed | 6894 passed | 5 skipped (6906)` / `Errors 1`**（75.2 秒）だった。赤のまま CI へ載せると条件1（green）を原理的に満たせず、`auto-on-green` が永久に発効しない。修正はアプリ実装への変更を伴い導入 PR のスコープ外のため、**CI 側でだけ**除外する。root の `vite.config.ts` は変更していないので、ローカルの `pnpm exec vp test`（パス指定なしの全量実行）はこれらを実行し続け、失敗は隠れない。隔離適用後の実測は **exit 0 / `Test Files 698 passed (698)` / `Tests 6827 passed (6827)`**（71.0 秒）。
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

- **この表が隔離リストの正本である。** `ci.yml` と `deploy.yml` の `--exclude` 群は同じリストの複製であり、**3箇所の一致を検査する機構は無い**。片方の workflow だけ除外を減らすとその workflow が赤くなり（fail-closed で安全側）、`deploy.yml` だけ除外を増やすと `ci` との被覆差が無言で生まれる（fail-open）。後者はこの表と両 workflow の diff を突き合わせて検出する。
- 解除条件: 各ファイルが `pnpm exec vp test --run <パス>` で exit 0 になった時点で、その1件を両 workflow の `--exclude` とこの表から外す。12 件すべてが外れた時点でこのエントリを `mitigated` にする。**このリストへの追加は CI の被覆の縮小にあたるため、追加する PR は同じ PR でこのエントリを更新する。** 解除は `packages/router/src/__tests__/index.test.ts` から着手する —— `packages/router` は**このリポジトリで唯一コードとして本番デプロイされるパッケージ**であり、その被覆を欠いたまま RISK-004（auto-deploy の受容）の「配信前ゲートが機能する」という前提を置いているため。
- 緑化の検知経路: 隔離した12件は CI では二度と走らないため、緑になったことを CI は検知しない。検知は**上記「再評価の契機」で `pnpm exec vp test --run`（パス指定なし）を実行した結果**による。この全量実行がこのエントリの anchor の一部である。
- anchor: 両 workflow の `--exclude` 行そのもの（追加・削除が PR diff に現れる）と、上記の全量 `vp test` の実行結果。加えて、`--exclude` に書いたパスが実在しなくなった場合（ファイル名変更・削除）、そのパスは何も除外せず、対象テストが赤ければ CI が赤くなる（fail-closed。除外の取りこぼしが緑に化けることはない）。

## RISK-003: PR CI は変更されたアプリだけをビルドする（全 346 アプリと `packages/` のビルドを行わない）

- date: 2026-08-17
- confidence: medium
- location: `.github/workflows/ci.yml` の `Detect changes` / `Build changed apps` ステップ
- status: accepted
- reason: standards `DOCS_OPS.md` §6 の役割分担は PR CI に「型検査 + ビルド + ユニットテスト」を課すが、同節の基本方針は「CI が担うのは安く・決定的に落ちるチェックだけ」である。2026-08-17 のローカル実測で1アプリのビルド（`apps/url-encoder` で `pnpm run build`）は **exit 0 / real 3.11 秒**であり、346 アプリを直列にビルドすると約 18 分になる（**この 18 分は1アプリの実測からの外挿であり、GitHub-hosted runner での実測ではない**）。PR ごとにこの費用を払うのは基本方針に反する。加えて、本番へ配信されるのは**コミットされた** `packages/router/public/` であって CI のビルド産物ではない（`deploy.yml` はビルドを行わない）ため、全アプリをビルドしても配信物の正しさは担保されない（配信物側の穴は RISK-008）。
- **被覆の境界（明記）**: 差分の pathspec は `-- 'apps/'` に限定しているため、**`packages/` 配下（`router` / `mcp-server` / `design-tokens-elchika` / `wasm-utils`）と `scripts/` / root 設定の変更は、どの workflow でもビルドされない**。`packages/router/src` は型検査の常時対象に入るが、ビルドは通らない。共有パッケージの破壊は `scripts/build-all.sh`（Step 0 で `wasm-utils` を先にビルドする）を実行するデプロイ作業まで顕在化しない。
- 残余（未検証経路）: `Build changed apps` と `Typecheck` の変更ファイル分は、**アプリを1件も変更しない PR では1度も実行されない**。導入 PR（#859）自身がこれに該当し、CI green が証明したのは「アプリを触らない PR で通ること」までである。シェルロジックは変更 0 件 / 2 件 / wasm 依存を含む 2 件の3ケースをローカルで模擬実行して確認したが、runner 上での実走は最初にアプリを変更する PR が初回になる。**その PR で赤が出た場合、まず「設計どおりの顕在化（触ったファイルの既存型エラー）」と「機構の破損」を切り分けること。**
- 残余（差分基準のずれ）: `github.event.pull_request.base.sha` はイベント発火時点の base 先端であって merge base ではない。base が進んだ後の再実行（Re-run all jobs）では、`git diff "$BASE_SHA" HEAD` が他 PR のマージ分まで拾い、**PR が触っていないアプリが検査・ビルド対象に入りうる**（過剰検出。fail-safe 側だが、無関係な既存型エラーで赤になる原因になる）。この場合は差分ログ（`変更されたアプリ:` / `変更された TS ファイル:` の出力）で対象を確認する。
- 解除条件: ①GitHub-hosted runner での全ビルド時間を実測し、CI の許容時間内（PR CI 全体で 10 分以内を目安とする）に収まると判明した場合、または②配信方式を「CI/Deploy でビルドして配信する」形へ変更した場合に、対象をリポジトリ全体へ広げて本エントリを `mitigated` にする。
- anchor: `ci.yml` の `Build changed apps` ステップのログが毎回「ビルドしたアプリ: N 件 / skip: M 件 / 対象外: K 件」を出力する（検出したすべてが3つのどれかに計上され、サイレントな打ち切りにならない）。ビルドが壊れたアプリ・パッケージが `main` へ入った場合は `scripts/build-all.sh` が `set -e` で停止し、デプロイ作業の時点で顕在化する。

## RISK-004: `merge_policy: auto-on-green` の採用で配信が人間の確認を経ずに起動しうる

- date: 2026-08-17
- confidence: high
- location: `AGENTS.md` の `merge_policy` / `.github/workflows/deploy.yml`
- status: accepted
- reason: `DOCS_OPS.md` §5 は「`auto-on-green` は auto-deploy を意味する」と明記する。当リポジトリは `main` push を起点に `packages/router` を Cloudflare Workers へ deploy するため、前提条件が揃った後はエージェントのマージがそのまま本番配信を起動する。346 アプリを1つの Workers プロジェクトで配信しているので、誤った成果物のマージは全ツールに同時に効く（過去に vite `base` の誤りで全アプリ白画面の事故が起きている。`.docs/ASSET_PATH_INCIDENT.md`）。それでも受容するのは、配信物が静的アセットのみで巻き戻しが再 deploy で足りること、および §5 の前提条件（required status check の green・レビューサイクル収束・ブラウザ検証証跡）が配信前のゲートとして機能するためである（2026-08-17 に ruleset `id=20942268` で `ci` が required・`strict=true` として設定され、条件1 は**技術ゲート**として成立している —— RISK-009 参照）。緩和として、①`deploy.yml` へ型検査とユニットテストを追加し、CI が赤のまま配信される経路を塞いだ ②`ci.yml` にも `check-asset-paths` を置き、白画面事故の原因をマージ**前**に検出できるようにした（`deploy.yml` の同検査はマージ後にしか走らない）。**ただし RISK-008 の穴は塞いでいない。**
- 解除条件: このエントリは配信方式そのものの受容であり、「解除」は auto-deploy をやめる（`merge_policy` を `human` へ戻す、または deploy を手動起動へ変える）ことを意味する。**受容を続ける限り `accepted` のまま**とし、下記 anchor の観測で受容が破れていないことを確認する。
- anchor: 本番の実体を検査する `node scripts/health-check-runtime.js`（346 アプリの HTML を取得し、参照先の JS/CSS を実際に GET して 200 と content-type を確認する。結果は `.docs/health-check-result.json` に残る）。受容が破れた場合、この実行結果に 200 でないアプリが現れる。

## RISK-005: standards rev.75 §1「参照資料と要求事項の分離（MUST）」に未対応

- date: 2026-08-17
- confidence: medium
- location: `AGENTS.md` の `## Architecture` 節 / `.docs/` 配下
- status: accepted
- reason: rev.75 が新設した `DOCS_OPS.md` §1「参照資料と要求事項の分離（MUST）」は、層の宣言を `AGENTS.md` の **Architecture 表**（責務列に「時点に依存する観測記録」と書いた行）で行うことを求め、宣言が無いプロジェクトでは「同表に列挙された文書の本文だけを正本を置いてよい場所として扱う」と定める。当リポジトリの `## Architecture` 節はディレクトリツリーであって文書の表ではなく、`.docs/` 配下（`APP_TEMPLATE_GUIDE.md` / `DESIGN.md` / `DESIGN_SYSTEM.md` / `TESTING_GUIDE.md` / `E2E_TESTING.md` / `COMPONENT_PATTERNS.md` / `STORYBOOK.md` / `ASSET_PATH_INCIDENT.md` 等）に置かれた要求事項が §1 の適合判定（①正本の文書名と節番号を伴う参照形か ②参照先に対応規定が実在するか）を通るかは未確認である。導入 PR は PR CI の新設と `merge_policy` の宣言を目的としており、`AGENTS.md` の構造改訂と `.docs/` 全文の棚卸しはスコープが別である。`standards_version` は「この版まで差分を確認した」を意味し（rev.71 で定義）、監査で検出したギャップが本エントリに記録されていれば版の更新を妨げない。
- 解除条件: `AGENTS.md` に文書単位の Architecture 表を新設し、`.docs/` 配下の各文書について §1 の①形式・②実体を判定して、要求事項の移設または正本ポインタの付与を完了した時点で `mitigated` にする。
- anchor: standards `AUDIT.md` の §1 対応 checkpoint（`AUDIT.md` の「参照資料と要求事項の分離」checkpoint。実在を確認済み）。上記「再評価の契機」②の `standards-audit` 実行でこのギャップが再検出される。

## RISK-006: PR CI は `wasm-utils` に依存するアプリをビルドできず skip する

- date: 2026-08-17
- confidence: high
- location: `.github/workflows/ci.yml` の `Build changed apps` ステップ
- status: accepted
- reason: `packages/wasm-utils/pkg/` は `packages/wasm-utils/.gitignore` の `/pkg` により git 管理外で、チェックアウトに含まれない。生成には Rust ツールチェーンと `wasm-pack` が必要（`packages/wasm-utils/build.sh` = `wasm-pack build --target bundler --out-dir pkg`）で、`package.json` の `postinstall` は `wasm-pack` が無い場合に警告を出して**成功する**ため、`pnpm install` では pkg ができない。GitHub-hosted runner に `wasm-pack` は入っていない。2026-08-17 のローカル実測で、`packages/wasm-utils/pkg` を退避した状態の `apps/bcrypt-hash` の `pnpm run build` は **exit 1** だった（pkg を戻すと通る）。該当アプリは2026-08-17 時点で `apps/bcrypt-hash` / `apps/hash-crc32` / `apps/zip-creator` の3件（`grep -rl wasm-utils apps/*/package.json`）。**workflow 側はこの一覧をハードコードせず `package.json` から毎回導出する**ので、アプリが増減してもこの記録の件数と workflow の挙動はずれない（この記録の「3件」は記録時点の観測値）。CI へ `cargo install wasm-pack` を足す案は、**その所要時間を未実測**のまま、これら3アプリを触らない大多数の PR にもコストを乗せることになるため採らなかった。
- 解除条件: 次のいずれかを行い、`packages/wasm-utils/pkg` が CI 上に存在する状態にした時点で `mitigated` にする。①CI に `wasm-pack` の導入ステップを（該当アプリが変更されたときだけ走る形で）追加する ②`packages/wasm-utils/pkg/` を git 管理下へ入れる。**判定は「CI のログに skip の `::warning::` が出ないこと」で行える。** いずれの場合も workflow の skip 分岐は自動的に無効になるため、workflow 側の変更は不要。
- anchor: `Build changed apps` ステップが skip のたびに `::warning::` を出し、末尾で「ビルドしたアプリ: N 件 / skip: M 件 / 対象外: K 件」を必ず出力する。これら3アプリのビルド破壊は `scripts/build-all.sh`（Step 0 で `wasm-utils` を先にビルドする）が `set -e` で停止することにより、デプロイ作業の時点で顕在化する。

## RISK-007: Deploy ジョブに build ステップを置いていない（§6 の役割分担表からの逸脱）

- date: 2026-08-17
- confidence: medium
- location: `.github/workflows/deploy.yml`
- status: accepted
- reason: `DOCS_OPS.md` §6 の役割分担表は Deploy（`main` push）を「型検査 + test（ユニット）+ build + deploy」と定め、ユニットテストの省略 MAY にも「ビルドは省略しない」と明記されている。導入 PR は同表を根拠に型検査とユニットテストを追加した一方、build は追加していない。理由は、このリポジトリが**コミットされた** `packages/router/public/` をそのまま配信する設計（`AGENTS.md` の「デプロイアーキテクチャ」に明文化）であり、deploy 経路にビルドを足すと配信されるものが変わる＝設計変更にあたるためである。また全 346 アプリのビルドは約 18 分かかる（RISK-003 の外挿）。同 PR が同じ表を引用しながら1項目だけ落としているため、逸脱を PR 本文だけに残さずここへ記録する。
- 解除条件: 配信方式を「CI/Deploy でビルドして配信する」形へ変える設計変更を行った時点で、build ステップを追加して `mitigated` にする（RISK-003 / RISK-008 の解除条件と同じ変更で同時に解ける）。
- anchor: `deploy.yml` のステップ列そのもの（build の有無が diff に現れる）。配信物が壊れた場合は `node scripts/health-check-runtime.js` が本番の実体で検出する。

## RISK-008: コミットされた `packages/router/public/` の鮮度を検証する経路が CI にもデプロイにも存在しない

- date: 2026-08-17
- confidence: high
- location: `.github/workflows/ci.yml` / `.github/workflows/deploy.yml` / `scripts/check-asset-paths.js`
- status: accepted
- reason: 本番へ配信されるのは**コミットされた** `packages/router/public/` である。しかし `ci.yml` の `Build changed apps` はアプリを `apps/<app>/dist` へビルドするだけで `public/` と突き合わせず、`scripts/check-asset-paths.js` が検査するのは ①`vite.config.ts` の `base` 値 ②`public/<app>/index.html` が絶対パスを参照していないか ③参照先ファイルの**実在** —— のみで、**ソースとの一致は一切見ない**（2026-08-17 にスクリプト全文を読んで確認）。したがって次の3つはいずれも CI 全 green で通る。①`apps/foo/src/` を変更して `public/foo/` を再生成し忘れた PR（古いアセットのまま配信される）②`apps/` にあって `public/` に無い新規アプリ（`public/` を列挙する検査なので対象にすらならない）③`apps/` から削除したが `public/<app>/` が残っているアプリ（配信され続ける）。**これは導入 PR が作った穴ではなく既存の構造だが、`merge_policy: auto-on-green` は人間の目を外すため、この穴の危険度を上げる。** 塞ぐには「全アプリをビルドして `public/` と差分比較する」検査が要り、RISK-003 と同じ約 18 分の費用がかかるため受容する。
- 解除条件: `public/` の鮮度を検証する検査（全ビルド + 差分比較、または `apps/` と `public/` のディレクトリ集合の一致検査）を導入した時点で `mitigated` にする。**ディレクトリ集合の一致（上記②③）だけなら安価に検査でき、部分的な解除として先に導入できる。**
- anchor: `node scripts/health-check-runtime.js`（346 アプリの HTML を取得し参照先を実 GET する）と、デプロイ作業時の `bash scripts/build-all.sh` 実行後の `git status` —— 再生成漏れがあれば `public/` に差分が出る。どちらもレビューループの外側にある観測である。

## RISK-009: §5 の MUST（required status check ＋ strict / merge queue）が未充足のまま `auto-on-green` を宣言している

- date: 2026-08-17
- confidence: high
- location: `AGENTS.md` の `merge_policy`
- status: mitigated（resolved: 2026-08-17 — 司令塔が下記の解除条件をすべて実施した。実測: ruleset `id=20942268` / `enforcement=active` / `bypass_actors` 空 / `required_status_checks` の context は `ci` の1本・`strict_required_status_checks_policy=true` / `allow_auto_merge=true`。あわせて `branch_policy` を `unprotected` から `protected` へ改めた。**逸脱していた期間は、この記録が置かれた PR がマージされる前までである**）
- reason: `DOCS_OPS.md` §5「マージ機構」は「`CHANGELOG.md` の rev 番号・migration の連番・lockfile のように、正しさが base の内容に依存する成果物を持つリポジトリが `merge_policy: auto-on-green` を宣言する場合は、required status check と、strict 設定または merge queue を有効化する（MUST）。**有効化できないリポジトリは `human` を選ぶ**」と定める。当リポジトリは `pnpm-lock.yaml` とコミットされた `packages/router/public/` を持つため該当するが、2026-08-17 実測で ruleset は0本・branch protection は404・`allow_auto_merge` は false であり、この MUST を満たしていない。standards 自身は rev.72 で同じ状況を理由に `human` を宣言し、rev.76 で ruleset を先に設定してから `auto-on-green` へ切り替えている（**設定が先・宣言が後**）。導入 PR はこの順序が逆である。それでも `auto-on-green` を宣言するのは、GitHub 側の設定変更がこのリポジトリの diff では行えず（司令塔がマージ後に実施する）、宣言と設定を1つの PR に収められないためである。**ここでいう「有効化できない」は恒久的な不能ではなく、実施主体と実施時点が別であることを指す。**
- **受容していた間の運用（解消済み）**: 設定が入るまでの間は `AGENTS.md` の `merge_policy` に「GitHub 設定が未完了の間、エージェントはマージ操作を行わず human 承認へ落とす」と明記し、実効の判定を `human` と同じ側へ倒していた（値だけを読む機構には `auto-on-green` と映るため、これは運用規律であって技術ゲートではなかった）。設定が入った現在は条件1 が技術ゲートとして成立しているので、この記述は `AGENTS.md` から外してある。
- 解除条件: 司令塔が ①ruleset を新設し required status check に `ci` を指定 ②strict 設定または merge queue を有効化 ③`allow_auto_merge` を有効化 —— を完了した時点で `mitigated` にし、あわせて `branch_policy` を `unprotected` から `protected` へ改める。**逆に、これらの設定を実施しない判断になった場合は `merge_policy` を `human` へ戻す**（宣言だけを残さない）。
- anchor: `gh api repos/elchika-inc/tools/rulesets` と `gh api repos/elchika-inc/tools --jq .allow_auto_merge` の出力。どちらもこのリポジトリの diff の外にある実測で、受容が解けたか続いているかを直接示す。加えて、受容が破れる形（設定が無いままエージェントがマージすること）は、§5 が MUST とする `agent-merge-verdict/*` コメントの有無と内容で PR ごとに突合できる。
