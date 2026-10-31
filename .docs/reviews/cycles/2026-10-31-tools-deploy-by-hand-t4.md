<!-- review-cycle:start 2026-10-31-tools-deploy-by-hand-t4 -->
## 2026-10-31 tools の手作業デプロイへの移行

- **Cycle ID**: 2026-10-31-tools-deploy-by-hand-t4
- **対象 HEAD**: `3f0eff5ffc552bba5e9c5f9e058a2cef48396ca8` 上の未コミット差分（下記 fingerprint で対象を固定）。
- **実装担当**: `codex-deploy-by-hand-t4`
- **総ラウンド数**: 2（上限 2）
- **終了理由**: 全員 LGTM。R1 も flag 0 だったが、optional の文法崩れを修正したため R2 で最終文面を確認した。
- **レンズ別 flag 件数**: R1・R2 とも Fresh Eyes 0 / Security 0 / Core Logic 0 / Tests 0 / Domain 0 / Ambiguity 0 / Altitude 0。
- **確定した偽陽性**: なし（過去の完全なサイクル記録が無いため carry-over なし）。
- **判断レンズへの差し戻し**: なし。
- **ACCEPTED_RISKS**: 今回のレビューで新たに受容した flag は無し。
- **レビューの境界**: 実装者とは別の `claude -p` プロセス 1 名が、各ラウンドで 7 レンズを順に適用。ツールと advisor を無効化した静的レビューであり、GitHub の実行や Cloudflare 設定を測ったものではない。

### 成功基準

委任仕様 Task 4 と [承認済み実装計画](https://github.com/elchika-inc/standards/blob/main/.docs/plans/2026-10-31-deploy-by-hand-plan.md) を正本とする。
削除・導入・宣言同期は指定範囲に限定し、CI の実行内容・Key Commands・隔離 12 件を維持する。
雛形は templates main とバイト一致し、2 workflow が YAML として読め、CI が production 宛てでも起動する。
独立レビューの flag はゼロまたは理由・anchor を付けた明示受容とする。
コミット後の範囲、PR 作成直前の重複、PR の ci 成功を別途測り、PR 本文と司令塔への完了報告に残す。
PR マージ・本番デプロイ・GitHub 設定変更は担当範囲外である。

### 対象

- `.docs/risk-registry.md`: `present:79d9580b41d1b09f6056a11e3f748fdd4cbc75ec`
- `.github/PULL_REQUEST_TEMPLATE/promotion.md`: `present:8a3a91b1d9a4b10f2fb6aab5249b0cd07c8fb088`
- `.github/workflows/ci.yml`: `present:ad698801041d334c0b3e508e34d008d1d0f0b8b1`
- `.github/workflows/deploy.yml`: `absent`
- `.github/workflows/promotion-source.yml`: `present:31b6b772d067b6e55de328bf70b51bd954d067ad`
- `AGENTS.md`: `present:d83ccd6eb5566ce7e884a761c91fd3edfda242de`

### レビュー実行

入力の順序は、レンズの指示、委任仕様の全文、standards の recipe の導入手順、`git diff -U20 origin/main`。
R2 は末尾に修正済み事項を置き、Fresh Eyes の findings 完成前には参照しないよう指示した。

```bash
wc -c <入力ファイル>
CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1 perl -e 'alarm shift @ARGV; exec @ARGV' 1200 claude -p --safe-mode --tools "" --model sonnet < <入力ファイル>
```

| ラウンド | 入力バイト数 / wc の exit | レビュー exit | flag | optional | 対応 |
|---|---|---|---|---|---|
| R1 | 109740 / 0 | 0 | 0 | 5 | RISK-002 の文法崩れ 1 件を修正し、最終文面を R2 へ |
| R2 | 110000 / 0 | 0 | 0 | 6 | 全レンズ LGTM、終了 |

R1 の差分 SHA-256: `f4b5418da15f560336d57a890b6291a491aabaa273124c02bc0aca7b7c8283ba`。
R2 の差分 SHA-256: `077afa12d933639b9aa4c7312950369df96969f826b12e7aed4fd9e8dc3fe6c8`。
各ラウンドの 7 ブロックは欠落・重複・結論形式・flag 件数を検査して原文のまま保存した。
打ち切り・再試行は無かった。

### optional の扱い

R1 の 5 件は、文法崩れ、Cloudflare Git 連携の確認、デプロイ操作の範囲、将来の CI 配信への解除条件の表現、手順の重複。
文法崩れだけ修正した。残りは終了条件外の提案として原文を残す。
R2 の 6 件は、解消記録の重複、Cloudflare Git 連携の確認、昇格時の CI ビルド件数、生成物の git 管理理由、初回整備の記述、手順の重複。
新たな実装・設定変更は加えない。Cloudflare Git 連携の有無と初回昇格時の CI 所要時間は未測定で、司令塔へ後続工程の参考として渡す。
optional を flag から格下げしたものは無い。

### コミット前の検証

次のコマンドはそれぞれ独立に実行し、結果を見てから次へ進めた。検証とコミットを連結していない。

1. 検索の陽性対照: 編集前は exit 0・15 行。編集後（本レビュー記録を追加する前）は exit 0・2 行。残りは RISK-004 の当時の受容記録と、変更対象外の `docs/superpowers/plans/2026-08-09-elchika-ui-pilot.md` の歴史記録。

   ```bash
   git grep -n "deploy.yml" -- . ":(exclude).docs/ASSET_PATH_INCIDENT.md" ":(exclude).docs/actions/done/**" ":(exclude).docs/plans/**" ":(exclude).docs/verification/**"
   ```

2. `python3` で `gh api` の base64 を復号し、作業ファイルの bytes と比較: exit 0・2/2 一致。

   ```python
   import base64, json, subprocess
   from pathlib import Path
   for path in ['.github/workflows/promotion-source.yml', '.github/PULL_REQUEST_TEMPLATE/promotion.md']:
       data = json.loads(subprocess.check_output([
           'gh', 'api', f'repos/elchika-inc/templates/contents/_base/{path}?ref=main',
           '--jq', '{sha,content}'
       ]))
       assert Path(path).read_bytes() == base64.b64decode(data['content']), path
       print(path, data['sha'])
   ```

   templates main: `fde8a248ff45b57e173bafbd332613d20fc14958`。
   workflow は 1753 bytes / blob `31b6b772d067b6e55de328bf70b51bd954d067ad`、PR 雛形は 3367 bytes / blob `8a3a91b1d9a4b10f2fb6aab5249b0cd07c8fb088`。

3. `python3` + PyYAML 6.0.3 の `BaseLoader` で `.github/workflows/promotion-source.yml` と `.github/workflows/ci.yml` を読み取り: exit 0・2/2 成功。job はそれぞれ `promotion-source` / `ci`。
4. 同じ parser で CI の `on` を検査: exit 0、`{'pull_request': ''}`。宛先・パスのフィルタが無いため production 宛ても起動する。
5. 編集前の workflow と比較: exit 0。CI の YAML 値は完全一致。削除対象の Unit test / Check asset paths の run は CI と完全一致。Typecheck は CI の常時対象 `packages/router/src` に保持されている。
6. bytes / テキストの比較: exit 0。Key Commands・README・隔離 12 件の表・全 11 件のリスク ID を維持。非対象 RISK-005 / 006 / 009 / 010 / 011 の本文、branch_policy / merge_policy / standards_version の宣言行も不変。
7. `git diff --check origin/main`: exit 0・出力無し。R1 optional の文法修正後も同じ結果。

ユニットテスト・E2E のローカル実行は N/A（Issue #866 に定義済み。アプリのソースと挙動を変えない）。
昇格元検査の実ランと本番確認は後続工程であり、構文検査や雛形一致を代用の成功証拠にはしない。

### レビュアーの原文

#### R1

##### fresh-eyes

LGTM／optional: RISK-002 の解除条件の末尾文が、編集で壊れて読めなくなっている

根拠:
- 設計上の事実と diff を突き合わせた。deploy.yml の Typecheck は `packages/router/src` のみで、ci.yml は常時対象に含む（事実どおり）。Check asset paths は両者とも `node scripts/check-asset-paths.js` で一致する。
- Unit test の 12 件の `--exclude` が ci.yml と完全一致するかは、diff に ci.yml の該当 hunk がないため入力だけでは確認できない。事実として与えられた内容を採用する。反証材料はない。
- 過剰実装は見当たらない。削除対象は deploy.yml のみで、追加は承認済み雛形と記述の更新に限られる。

optional:
- RISK-002 の解除条件の末尾が文として成立していない。「その被覆を欠いたまま 手作業への移行後も本番へ出すコードの被覆が必要なため。」は、RISK-004 への言及を差し替えた際に前半が残ったもの。「欠いたまま」の述語が無く、直前に不要な空白もある。着手順の理由が読み取れないだけで、運用を誤らせるほどではないため optional とする。

##### security

LGTM

根拠:
- promotion-source.yml は `pull_request_target` を使うが、checkout も head のコード実行もしない。`permissions` は `contents: read` のみ。
- `HEAD_SHA` / `REPO` / `HEAD_REPO` は `env` 経由で渡しており、`run:` 内へ式を直接展開していない。シェルインジェクション経路はない。
- 先に `HEAD_REPO != REPO` で fork を拒否している。比較は API 呼び出しのみで、失敗時は `set -euo pipefail` と `if !` で fail-closed になる。
- ci.yml に secrets 参照や権限拡大は入っていない（コメント変更のみ）。deploy.yml の削除で `CLOUDFLARE_API_TOKEN` を参照する経路は消えた。
- Secret の削除は仕様でスコープ外。実鍵形式の値は diff に無い。

##### core-logic

LGTM

根拠:
- `compare/main...$HEAD_SHA` の status は、head が main と同一なら `identical`、main の祖先なら `behind`、それ以外は `ahead` / `diverged` になる。`identical|behind` のみ許可する分岐は「head が main の祖先」の定義と一致し、境界は正しい。
- head SHA が main 側に存在しない場合や API が失敗した場合は、`if ! status=$(...)` で exit 1 になる。空文字が通る経路はない。
- ci.yml は `pull_request` でフィルタが無く、production 宛て PR でも起動する（事実どおり）。job id が `ci`、promotion-source が `promotion-source` で、ruleset の required context 名と一致する。
- deploy.yml で行っていた検査（型検査・ユニットテスト・アセットパス検査）は ci.yml に残る。検査の穴は増えていない。
- ci.yml のコメントにある「build-all.sh の先頭でも同じ検査」は、AGENTS.md の記述（build-all.sh の先頭に組み込み済み）と整合する。

##### tests

LGTM

根拠:
- `AGENTS.md` に `standards_version` があるため、条件選択の基準を適用した。アプリのソースと挙動は変えず、変更は workflow の削除、承認済み雛形の導入、文書の更新に限られる。
- 「外した条件と理由」は設計上の事実に明記されている。ユニットテストと E2E の追加は Issue #866 で N/A と定義済み。promotion-source の実ランは production の保護整備後の別工程。既存 ci は PR 作成後に実測する。
- 関わる類型（失敗・状態・不正な入力）の振る舞いは、改変していない雛形がバイト一致で担保している。今回の検査対象は、構文・起動条件・検査の保持・権限境界で、事実どおり妥当。
- テストコードの変更は無く、隔離・後片付け・並行衝突の論点は無い。

##### domain

LGTM／optional: 「`main` へのマージはデプロイを起動しない」の前提に、Cloudflare 側の Git 連携が無いことの確認記録が見当たらない

根拠:
- recipe の導入手順（3 deploy workflow を消す、PR CI が production 宛てでも起動、promotion-source を main に先に入れる、4 順序、5 設定前に設定済みと書かない）に沿っている。
- AGENTS.md は「`production` の作成と ruleset は別に行い、完了後に初回の昇格へ進む」と書き、設定済みを主張していない。`branch_policy` への実測追記も後続 PR に回している。
- 移行時の文書整合は、deploy.yml を指す記述が表・ci.yml のコメント・台帳の `location` で更新されている。RISK-004 / 007 は旧受容理由を残し、マージ時の解消を括弧書きで区別している。
- 手作業のデプロイ手順（clean 確認 → fetch → `switch --detach origin/production` → build-all → deploy → 記録 ID と SHA を昇格 PR へ）は、promotion.md の「本番に出た後の確認」欄と対応している。

optional:
- AGENTS.md と RISK-004 の anchor は、デプロイ起動源が無いことの根拠を「workflows にデプロイ workflow が無い」ことに置いている。Cloudflare の Git 連携（Workers Builds）が `main` に接続されていれば、この主張は崩れる。recipe 手順 3 も Git 連携の有無を確認対象にしている。初回の昇格前の確認項目として一言残すとよい。

##### ambiguity-hunter

LGTM／optional: 「デプロイのコマンド」の範囲と RISK-003 解除条件②の「Deploy」が、移行後の状態に照らして二通りに読める

根拠:
- 起動条件（README・AGENTS.md・設計文書に相当する文章仕様）を満たすため、7 パターンを当てた。確信度 80% 以上で、記述に従うと誤運用に至る曖昧さは検出していない。
- 台帳の旧受容理由が `deploy.yml` を指しているのは、歴史的記述（除外対象）。新旧の区別は「2026-10-31 の更新」「reason（2026-08-17 の受容記録）」の見出しで明示されており、陳腐化参照にはあたらない。
- RISK-004 / 007 の `status: mitigated` は、「マージ時に解消。ruleset の設定完了を意味しない」と限定されている。

optional（確信度 80% 未満のため flag にしない）:
- AGENTS.md の「エージェントはデプロイのコマンドを実行しない」は、同じコードブロックにある `bash scripts/build-all.sh`（ビルド）を含むか読み分けがつかない。「`pnpm run deploy` を含むデプロイ操作は人のみ」のように対象を名指しすると消える。
- RISK-003 の解除条件②「CI/Deploy でビルドして配信する形へ変更」の「Deploy」は、Deploy workflow 削除後は指す先が無い。手作業での `build-all.sh` 実行が②に当たらないことは reason 側から読み取れるが、「CI でビルドして配信する形」に直すと読み違いを防げる。

##### altitude-checker

LGTM／optional: AGENTS.md の「デプロイ」節が、standards の昇格手順の細目をコマンド単位で再掲している

根拠:
- 起動条件を満たすため 5 パターンを当てた。計画・設計文書ではないので、パターン#5（scope excess）は対象外。
- 正本へのポインタは付いている（standards の本番への昇格手順）。委譲済みの機構詳細が原則文書に二重化してドリフトや正本の上書きが起きる、というレベルの問題は検出していない。
- 台帳側の追記は、旧記録を残したうえでの「2026-10-31 の更新」であり、一回性の一般化にもあたらない。

optional:
- AGENTS.md の「デプロイ」節にある `git fetch origin` / `git switch --detach origin/production` の手順と、「記録 ID と SHA を昇格 PR の欄に残す」は、standards の recipe と promotion.md が正本の内容と重なる。リポ固有の build-all → deploy だけを残し、前段は「手順は正本に従う」へ圧縮すると、正本の改訂とずれにくい。誤運用には至らないため optional とする。

#### R2

##### fresh-eyes

LGTM／optional: RISK-004 と RISK-007 は、解消の事実が status 括弧、「2026-10-31 の更新」行、解除条件の 3 か所に重複している

根拠:
- 差分全体を、与えられた設計上の事実と突き合わせて独立に確認した。
  - `deploy.yml` の削除に伴い、旧 Deploy の Typecheck / Unit test / Check asset paths は、与えられた事実のとおり `ci.yml` に同一コマンドで残っている。検査の喪失は見当たらない。
  - 追加した `promotion-source.yml` と `promotion.md` は雛形の取り込みで、自前実装への降格は無い。降格理由の欠落による flag 条件は不成立。
  - `ci.yml` はコメントのみの変更で、step の挙動は変わらない。
  - AGENTS.md の宣言行は、委任仕様 §2-3 どおりに置換されている。`deploy_policy` の行と子の行は消えている。
- optional の内容: RISK-004 と RISK-007 は、解消の事実を同じ記録内で複数回述べている。読んで誤運用に至るものではないので、flag にはしない。

##### security

LGTM

根拠:
- `promotion-source.yml` は `pull_request_target` で動くが、checkout も head のコード実行も行わず、GitHub API の compare だけを呼ぶ。信頼境界の運用は適切。
- `permissions` は `contents: read` のみ。Secret の参照は無く、`GH_TOKEN` は `github.token` のみ。
- `head.sha` と `head.repo.full_name` は `env` 経由で渡し、`run:` に式として直接展開していない。スクリプトインジェクションの経路は無い。
- fork 由来の head は、`HEAD_REPO != REPO` で明示的に拒否している。
- `deploy.yml` の削除で、`CLOUDFLARE_API_TOKEN` を参照する workflow が減り、攻撃面は縮小する。Secret の削除自体は対象外で、PR 本文に別工程と書かれる想定。
- `ci.yml` の変更はコメントのみ。AGENTS.md に記された「secrets 不参照・`permissions: contents: read`・`environment` なし」の前提は崩れない。

##### core-logic

LGTM

根拠:
- `promotion-source.yml` の判定は `compare/main...HEAD_SHA` の status で行う。
  - `identical|behind` だけを通す。
  - `ahead` / `diverged` と取得失敗は exit 1 になる。
  - `set -euo pipefail` と `if ! status=$(...)` の組み合わせで、API 失敗が緑に化けることはない。
  - head が main の祖先であるという意図と判定が一致している。
- 旧 `Deploy` は required check ではない。ruleset の context は `ci` の 1 本なので、`deploy.yml` を消しても、存在しない check を待ち続ける BLOCKED は発生しない。
- 与えられた事実のとおり、`ci.yml` の `pull_request` はフィルタ無しである。`production` 宛て PR でも `ci` が起動し、`promotion-source` と並んで required にできる。
- 台帳の整合: リスク ID 11 件と隔離 12 件の表は維持されている。`--exclude` の複製は `ci.yml` の 1 か所だけになり、「3 箇所」から「2 箇所」への修正（表 + `ci.yml`）と一致する。
- RISK-004 と RISK-007 は、status に「マージ時に解消」と書き、旧受容理由を残している。「production の ruleset の設定完了を意味しない」との区別も明記されており、未設定を設定済みとは読ませない。

##### tests

LGTM

根拠:
- `AGENTS.md` に `standards_version` があるので、条件の類型（境界・量・不正な入力・失敗・状態・時刻と地域・並行）を確認した。
- 変更は workflow・文書・台帳のみで、アプリのソースと挙動には触れない。ユニットテストと E2E を追加しない理由は、「外した条件と理由」に Issue #866 の N/A 定義として残っている。
- 関わる類型と、その扱い:
  - 失敗 / 状態: `promotion-source` の compare 失敗と祖先判定は、承認済み雛形をそのまま導入したもの。実ランは production の保護を整備した後の別工程と、理由つきで記録されている。
  - 保持: 旧 Deploy の検査が `ci.yml` に残ることは、コマンド一致で確認済み。
  - 構文・起動条件: 2 workflow の YAML 読み取りと、`on: pull_request` がフィルタ無しで `production` 宛てでも起動することを確認済み。
- `ci` の実測は PR 作成後の `gh pr checks` で行う計画があり、実測値の追記は対象外と明示されている。
- テスト隔離・後片付け・並行衝突の観点は、テストコードの変更が無いので該当しない。

##### domain

LGTM／optional: 次の 2 点は、確信度が flag の基準に達しないため optional とする。
- (1) AGENTS.md の追記が、`main` へのマージはデプロイを起動しないと断定している。Cloudflare 側の Git 連携（Workers Builds 等）の有無は、与えられた事実と差分から確認できない。
- (2) 昇格 PR（base が `production`）では、`ci` の Detect changes が production と head の差分を取る。初回や間隔が空いた昇格では、ビルド対象のアプリが多くなりうる。

根拠:
- GitHub Actions の観点
  - `promotion-source` の job id が check 名になり、AGENTS.md の CI 表の「check 名 `promotion-source`」と一致する。ruleset の required context とも整合する。
  - `pull_request_target` の `branches: [production]` と types の指定は、recipe 導入手順 3・4 の雛形どおり。
- 手作業の本番昇格の観点
  - `deploy_branch: production` で `deploy_policy` を書かない形になっている。
  - 「デプロイ」節に、昇格 PR のマージ後に人が `origin/production` から出すこと、エージェントは打たないことが入っている。clean 確認、`fetch`、`switch --detach` の順序も明記されている。
  - production の作成・ruleset・Secret は別工程で、設定済みとは書かれていない（recipe 導入手順 5 に適合）。
- 移行時の文書整合の観点
  - `deploy.yml` を指す記述は、AGENTS.md の表・設計原則・ci.yml コメント・台帳 location から外れている。
  - 台帳 RISK-004 / 007 / 008 は、過去の受容記録を残しつつ移行後の状態を併記している。
- optional (1) の補足: recipe 導入手順 3 は、Git 連携を使う場合に production branch の指定を求めている。ただし、このリポが Git 連携を使っている証拠は無い。
- optional (2) の補足: 初回昇格の計画段階で時間を把握しておけばよい。

##### ambiguity-hunter

LGTM／optional: AGENTS.md の設計原則で、`packages/router/public/` は「git 管理が必須」のまま残っている。一方で、続く文は「`build-all.sh` で生成した `public/` を人が配信する」に変わった。このため、コミット済み `public/` が必須である理由が文面から読めなくなった（パターン#6 の近縁）。
- 確信度は 80% 未満で、読んで誤運用に至るとは言えないため optional。
- 理由を追うなら、RISK-008 を参照しても配信物との関係までは書かれていない。

根拠:
- 起動条件に該当する文書（AGENTS.md ほか）を対象に、7 パターンを確認した。
- #1 暗黙の基準: 「本番の昇格には人の承認が必要」と、承認の欄は昇格 PR テンプレート（承認節）が正本で、定義は明確。
- #2 境界: デプロイは「人が行う」、エージェントは「実行しない」と対で書かれている。
- #3 主観語: 見当たらない。
- #4 収束条件: 新規のループは無い。
- #5 重複定義: 隔離リストの正本は RISK-002 の表と明示されている。複製は `ci.yml` の 1 か所で、ドリフトの検出方法も書かれている。
- #6 宙吊り参照: `deploy.yml` への参照は残っていない。「Key Commands の deploy 手順」は、実在する見出しを指す。
- #7 anti-gaming: RISK-004 / 007 は mitigated の根拠を anchor に置いている。
- 「根拠が無い判断」型で、`product-design-lens` への差し戻しが必要なものは無い。

##### altitude-checker

LGTM／optional: AGENTS.md「デプロイ」節の次の 2 点は、誤運用には至らない好みの範囲で optional とする。
- (1) 「`production` の作成と ruleset の整備は司令塔と人が別に行い…初回の昇格へ進む前に、その整備を完了する」は、時点依存の記述である。後続 PR で実測値を `branch_policy` に記録した後は陳腐化する（パターン#3 近縁）。
- (2) `git fetch` / `git switch --detach` の人向け手順は、standards の昇格手順と重なる。正本へのリンクはあるため、ドリフトの余地は小さい。

根拠:
- 起動条件に該当する文書を対象に、5 パターンを確認した。
- #1 固有語彙: 「司令塔」は既存の RISK-009 にも使われており、このリポの文脈で既出。flag 条件には当たらない。
- #2 委譲可能な詳細: 手順は正本へのポインタつきで、台帳が緩和内容の正本という構造も保たれている。
- #5 scope excess: 仕様 §2 の範囲を超える機能・設定項目の追加は見当たらない。
- 指摘の方向は「圧縮すれば読みやすい」であり、flag の条件（正本の上書き・誤運用）には該当しない。

<!-- review-cycle:end 2026-10-31-tools-deploy-by-hand-t4 -->
