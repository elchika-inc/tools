# PR CI の新設と merge_policy の採用（standards rev.77 追従）

- date: 2026-08-17
- 実装担当識別子: `claude/tools-pr-ci-worker-1`
- ブランチ: `naoto24kawa/add-pr-ci` / PR: elchika-inc/tools#859
- 出自: Orca dispatch `task_b8bf796c8a8f`（司令塔からの委任）

## ゴール

standards rev.77 へ追従し、`DOCS_OPS.md` §5 の `merge_policy` と §6 の PR CI を tools へ適用する。

## スコープ

| 含む | 含まない |
|---|---|
| `.github/workflows/ci.yml` の新設（PR トリガー） | GitHub 側の設定変更（ruleset・required status check・strict・`allow_auto_merge`）——司令塔がマージ後に実施 |
| `.github/workflows/deploy.yml` への型検査・ユニットテストの追加 | `deploy.yml` の deploy 経路そのものの変更 |
| `AGENTS.md` への `branch_policy` / `merge_policy` / `standards_version` の記録 | standards リポジトリの変更（read-only） |
| `.docs/risk-registry.md` の新設 | アプリケーションコードの機能変更・リファクタリング（既存の赤テスト12件・型エラー2017件の修正を含む） |

## 成功基準（rubric）

1. PR CI の check が1本存在し、required に指定できる安定した名前を持つ（**`ci`**）
2. CI に載せた検査が、ローカルで実際に exit 0 になることを実測済み
3. 型検査が実際に発火することを mutation（故意の型エラー）で確認済み
4. `ci.yml` の job が `DOCS_OPS.md` §6 の信頼境界の**内側**に留まる（secrets 0 個・`permissions` は read のみ・`environment` 無し・GitHub-hosted）
5. `AGENTS.md` に `branch_policy` / `merge_policy` / `standards_version` が §5 / §2 の要求どおり記録されている
6. rev.70 → rev.77 の差分で tools に影響する項目が、対応済みか `.docs/risk-registry.md` に記録されている
7. `gh pr checks` が全 check green
8. レビューサイクルが収束（確信度80%以上の flag が0。最大3ラウンド）

## 1 PR = 1 実装エージェント

この計画に記録した実装担当識別子は `claude/tools-pr-ci-worker-1` の1種類のみ。作業ブランチへコミットするのはこの1体だけで、レビュー担当は read-only で指摘のみを報告する（実ファイルの修正は行わない）。同じ識別子で再開したセッションは同一体として扱う。

## マージ

`merge_policy` の前提条件（required status check ＋ strict 設定または merge queue）が未充足のため、**この PR のマージは human 承認による**。エージェントはマージ操作を行わない。
