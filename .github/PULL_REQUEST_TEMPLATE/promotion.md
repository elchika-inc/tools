<!-- 昇格の手順: https://github.com/elchika-inc/standards/blob/main/recipes/production-promotion.md#昇格の手順 -->
<!-- チェック欄は空で渡す。コピー時の確認済み表示が虚偽の完了記録になるのを避け、実施後だけチェックする。 -->

## 昇格する範囲

<!-- production..promote/YYYY-MM-DD（同日の2回目以降は -2、-3）の commit 範囲と、比較した両端の SHA を記す。 -->
<!-- 初回も同じ範囲で記録する。昇格用ブランチに commit を足さず、origin/production も取り込まない。 -->

- commit 範囲: `production..promote/YYYY-MM-DD`
- production の SHA:
- 昇格する head SHA:

## 含まれる PR

<!-- 上記の範囲に含まれる PR のリンクと変更内容を列挙する。PR が無い commit はその SHA と理由を書く。 -->

| PR / commit | 変更内容 |
|---|---|
| | |

## 含まれる migration

<!-- 無ければ「なし」。ある場合はファイル・対象・適用順・事前準備を列挙し、D1 の場合は以下の手順に従う。 -->
<!-- https://github.com/elchika-inc/standards/blob/main/recipes/d1-migration.md -->

## 本番前の確認

<!-- 昇格する head SHA を対象に、CI と AI_FIRST.md §2 のローカル検証のコマンド・結果・証跡を記す。未実施は未実施と書く。 -->
<!-- 初回に promotion-source が現れない場合の代替確認は、昇格の手順に従って結果を記録する。 -->

- 対象 head SHA:
- CI の結果・URL:
- ローカルのユニットテスト（昇格する head SHA で実行したコマンドと終了コード）:
- ローカル検証の結果・証跡:
- [ ] CI と本番前の確認結果を記入した

## 本番に出た後の確認

<!-- マージ前は未実施と記す。承認 SHA と origin/production の tree 差分、production の先端 SHA と deploy run の headSha・実行結果、本番の動作確認の証跡を記す。 -->

- 承認 SHA と本番の内容の照合:
- deploy run の SHA・結果・URL:
- 手作業のリポのデプロイ記録の ID と SHA（deploy run の代わり）:
- 本番の動作確認の結果・証跡:
- [ ] 本番に出た内容と deploy の成功、本番の動作を確認した

## エージェント実装の来歴

<!-- エージェントが作った昇格 PR では、実装担当識別子にこの昇格 PR を作ったエージェントの Task ID / session ID 等を書く。含まれる各 PR の実装担当とは区別する。人が作った場合はその旨を書く。 -->

- 実装担当識別子:

## 解説

<!-- 今回の昇格で利用者に何が変わるかを、非エンジニアにも分かる言葉で説明する。 -->

## 承認

<!-- CI と本番前の確認結果を埋めてから、人へ対象 head SHA を示して承認を求める。承認前は未承認と記す。 -->
<!-- 承認後に以下を埋め、マージ直前の head SHA との一致を確認する。代行マージの verdict は agent-merge-verdict/human-v2 を使う（昇格の手順参照）。`deploy_policy` が `auto-on-green` の引き金では、エージェントが条件を確かめて agent-merge-verdict/deploy-v1 を残し、この節の 3 項目に `N/A（auto-on-green）` と書く。 -->

- 承認した人:
- 承認の対象の head SHA:
- 承認の所在:
