---
trigger: next-session
created: 2026-07-31
autonomy: manual
---

# CI の Cloudflare API トークンが失効し、自動デプロイが失敗し続けている

## 現象

`main` への push で走る Deploy ワークフローが**連続して失敗**している。
2026-07-30 時点で確認した直近 5 回はすべて failure だった（SP2 以前の push を含む）。

失敗箇所は `npx wrangler deploy` で、エラーは認証系である。

```
A request to the Cloudflare API (/accounts/***/workers/services/tools-router) failed.
  Authentication error [code: 10000]

A request to the Cloudflare API (/accounts) failed.
  Invalid access token [code: 9109]

📎 It looks like you are authenticating Wrangler via a custom API token set in an environment variable.
Please ensure it has the correct permissions for this operation.
```

`.docs/actions/after-deploy-pr837-deploy-workflow-verify.md` には
「`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` は 2026-06-02 に GitHub Secrets へ登録済み」とあるため、
登録後に失効したか、権限が変更されたと考えられる。

## 影響

**push しても本番へ反映されない。** コミットは main に入るが配信は古いままになる。
Deploy ワークフローの failure に気づかないと、「マージした＝反映された」と誤解する。

なお 2026-07-31 の SP2 デプロイは、ローカルの wrangler 認証を使った手動デプロイで回避した
（ローカルは `workers (write)` スコープを保持しており `wrangler whoami` が exit 0 を返す）。

## 方針（2026-07-31 ユーザー判断）

**当面はデプロイを手動で進めてよい。** したがって本 action は緊急ではない。
手動デプロイの手順は次のとおりで、2026-07-31 の SP2 デプロイで実際に成功している。

```sh
cd packages/router
pnpm run deploy                       # bun run build && wrangler deploy
node ../../scripts/health-check-runtime.js   # 346 / 346 正常を確認(リポジトリルートから実行してもよい)
```

ただし**放置すると副作用がある**。Deploy ワークフローは push のたびに走って失敗し続けるため、
失敗通知がノイズになり、本当に見るべき失敗を見落としやすくなる。
トークンを直さないなら、ワークフローを無効化するか手動実行専用
（`on: workflow_dispatch` のみ）へ変える選択肢もある。これはユーザー判断。

## やること（ユーザーが実施）

**秘密を扱うため AI は実行しない。**

1. Cloudflare ダッシュボードで API トークンを再発行する。
   必要なスコープは、手動デプロイに使えているローカル認証と同等
   （`account (read)` / `user (read)` / `workers (write)`）
2. GitHub の Secrets を更新する（`CLOUDFLARE_API_TOKEN`、必要なら `CLOUDFLARE_ACCOUNT_ID`）
3. 更新後、空コミットか任意の push で Deploy ワークフローを走らせる

存在確認をする場合は `${VAR:+yes}` を使う。`${VAR:-default}` は設定済みだと
**値そのものが標準出力＝ログに漏れる**（URISK-012）。

## 完了条件

1. `gh run list --limit 3` で Deploy が success になっている
2. `node scripts/health-check-runtime.js` が exit 0（346 / 346 正常）
3. デプロイ済みバージョンが最新コミットの内容であること
   （HTML が参照する JS/CSS を実際に GET し、200 かつ content-type が JS/CSS であること）

## 注意

- **デプロイ直後は Cloudflare のエッジ伝播に時間がかかる。** 2026-07-31 の手動デプロイでは、
  デプロイ完了直後の取得で 404 を観測したが、時間をおくと 200 になった。
  1 回の 404 で失敗と判定せず、再取得して切り分けること
- 併せて Node.js のバージョン更新も未対応
  （`.docs/actions/after-deploy-pr837-deploy-workflow-verify.md` の項目 4）

## 関連

- `.docs/actions/after-deploy-pr837-deploy-workflow-verify.md`（2026-06-02 のトークン登録記録）
