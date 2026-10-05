# JudgeOps：雲端監控＋Codex 執行器

第一版實作日期：2026-10-05。報告入口：`https://judge.tw/admin/agent-ops`（僅管理員）；後台總覽也有入口。

## 已實作的流程

```mermaid
flowchart LR
  Monitor[Railway 每分鐘收集指標] --> Evidence[(PostgreSQL 證據 / 異常 / 任務)]
  Evidence -->|HTTPS 專用憑證 + 租約| Runner[本機 Codex 執行器]
  Runner --> Triage[事件主管 TRIAGE]
  Triage --> Specialist[SRE / JUDGE / ENGINEER]
  Specialist --> Review[獨立審查 REVIEW]
  Review -->|每階段存檔| Evidence
  Evidence --> Dashboard[後台報告與每日摘要]
```

- 雲端使用既有 Railway API、PostgreSQL、Redis 指標及 Vercel 首頁探測，不新建付費 GCP 服務。
- 每個工作有三次獨立 Codex 調用；主管選擇專家，專家接收前一階段，審查者核對兩階段說法與證據。這是依序交接的多代理工作流，並非同時開三個無限制代理。
- Codex 只用本機 `codex login` 的 ChatGPT 身分；不配置 OpenAI API key、不自動切換付費 API。會消耗同一帳號的 Codex 額度，可能與你手動寫程式競爭額度。
- 每分鐘收集首頁 HTTP、判題心跳、佇列、15 分鐘服務錯誤、Redis、退款待查與帳號信件失敗等**彙整值**。不傳送 email、IP、使用者程式、帳單內容、密鑰或原始日誌。
- 異常發生建立一個 incident，每個 incident 自動調查一次；連續三個相隔至少 45 秒的正常樣本才標示恢復。資料缺失不算恢復。
- 台灣時間每天 09:00 後第一個有效樣本排入當日摘要；執行器離線時留在佇列。超過一天的未執行每日摘要會取消，避免恢復後消耗大量額度。
- 後台每 15 秒更新，可以手動收集／調查、看證據與角色交接、調整每天工作啟動上限、暂停派工、重試、取消工作及撤銷執行器。

## 憑證與啟動

需要 Node.js >=20、專案依賴，以及已通過驗收的 Codex CLI 0.160.0 或相容版本。CLI 升級後重跑下方實際驗收，避免事件格式或權限選項改變。

1. 執行 `codex login`，選 ChatGPT 帳號。`pnpm --filter @oj/ops-runner start --check` 只檢查登入，不呼叫模型。
2. 在 AI 維運中心建立執行器憑證。完整值只顯示一次，90 天到期；資料庫只存 SHA-256。最多五個有效憑證。
3. 在 `apps/ops-runner/.env.local` 寫入以下內容，權限設成 `600`。此檔被 Git 忽略，不要貼到討論或 commit。

```dotenv
JUDGEOPS_API_URL=https://api.judge.tw
JUDGEOPS_RUNNER_TOKEN=填入後台產生的憑證
# 留空時用 CLI 預設模型；可設定自己帳號可用的模型名稱。
# JUDGEOPS_CODEX_MODEL=
```

前景執行（在 repo 根目錄）：

```sh
node --env-file=apps/ops-runner/.env.local --import ./apps/ops-runner/node_modules/tsx/dist/loader.mjs apps/ops-runner/src/cli.ts
```

macOS 自動啟動：

```sh
node scripts/operations/install-judgeops-launchagent.mjs
```

這會建立當前使用者的 `~/Library/LaunchAgents/tw.judge.ops-runner.plist`，立即啟動並在登入後自動啟動。憑證仍只在 env 檔，plist 不包含憑證。日誌在 `apps/ops-runner/runtime/runner*.log`，只記錄工作 id、狀態和固定錯誤訊息。關閉／睡眠電腦會暫停 AI 工作；雲端持續收集，重新上線後接續未完成階段。Mac 不是 24 小時服務保證。

停用本機自動啟動：

```sh
node scripts/operations/install-judgeops-launchagent.mjs --uninstall
```

更换／退役電腦時，同時在後台撤銷原憑證；刪掉本機 env 檔。額度不足或登入失效會暫停雲端派工，先恢復額度／登入，再到後台重試工作並開啟派工。若前景執行器已退出，需重新啟動。

## 執行與安全界線

- 初始派工預設關閉，預設每天最多啟動 4 個工作（含重試，每個最多三個角色）；全域同時一個工作。上限可設 1–20，這是工作數限制，**不是精確 token 預算或 Codex 剩餘額度讀取**。
- 同時請領用 PostgreSQL advisory lock 序列化；租約 180 秒、每 30 秒續約，一次嘗試最多 20 分鐘，單階段最多 4 分鐘。非格式／認證／額度錯誤最多三次嘗試；重試也計入當日啟動數。
- 每階段先存結果再交接。相同回報透過 receipt 去重，HTTP 回應遺失會重送結果，不重跑模型。過期租約不能覆寫新執行器工作；取消後晚到結果不能讓工作復活。
- Codex 在臨時目錄、read-only sandbox、無互動批准、忽略使用者設定／rules／外掛，禁用 shell、MCP 外掛、瀏覽器及其他工具。子行程環境只保留本機登入必要項目，不繼承付款／資料庫／API／JudgeOps 憑證。
- 嚴格 JSON schema、字串／陣列大小與引用證據檢查；未預期工具事件拒絕，無法驗證的輸出暫停。這些只验证結構與引用存在，不能證明模型推論永遠正確。
- 管理員操作使用現有登入、ADMIN 角色與 CSRF；專用 bearer token 只能請領、續約及回報 JudgeOps 任務，不能存取一般內部維運或其他管理功能。
- 首頁 200 不等於登入／付款／所有題目可用，歷史 failed 也不等於現在故障。UI 分開「報告完成」、「審查需更多證據」及「監控確認恢復」。

## 目前尚未涵蓋

此版完成**監控 → 分工分析 → 審查 → 報告**，模型不修改 repo、不建立修復 PR、不重新部署、不重啟服務、不退款、不修改測資。這些未執行的動作只會列成待確認的建議。

目前監控 collector 與 API 共用程序和資料庫；整個 Railway API／DB 停止時，不能自行寫入停機事件。UI 對過期資料顯示未知，本機記錄 API 不可達。既有外部 uptime／GitHub 健康檢查應保留；要達成故障域隔離，下一階段將外部探測移到獨立 Cloud Run／Cloud Scheduler 與独立事件儲存，再接本派工 API。尚未宣稱建好 GCP 高可用監控。

本版不會每天主動測真實付款、寄信、Google OAuth 或 430 題全語言評測。後續合成檢查需使用專用帳號／隔離測資與有上限的 Sandbox 配額，再把結果作為可引用證據。

下一階段：隔離 worktree 修復 PR → 測試／安全代理驗證 → 管理員批准部署 → rollout 與回復紀錄。履歷指標應實測 rules-only、單代理與本三階段的誤報、引用品質、耗時和用量，不能以角色數量當成成效。

## 驗證方式

常規驗證不使用付費模型：

```sh
pnpm exec vitest run tests/agent-ops.test.ts
pnpm --filter @oj/api typecheck
pnpm --filter @oj/ops-runner typecheck
pnpm --filter @oj/web typecheck
pnpm exec playwright test tests/e2e/agent-ops.spec.ts
```

DB 與 HTTP 驗收**只接受**本機 PostgreSQL `127.0.0.1:56432/oj_test`、Redis `127.0.0.1:57379`；請建立專用 disposable 服務並先 migrate deploy。測試會清除該庫 AgentOps 測試紀錄，不能指向既有開發庫。

```sh
RUN_JUDGEOPS_DB_TESTS=1 DATABASE_URL=postgresql://oj_test:oj_test_local_only@127.0.0.1:56432/oj_test pnpm exec vitest run tests/agent-ops.integration.test.ts
pnpm --filter @oj/api build
DATABASE_URL=postgresql://oj_test:oj_test_local_only@127.0.0.1:56432/oj_test REDIS_URL=redis://127.0.0.1:57379 node --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/operations/verify-judgeops.ts
```

最後一條加 `JUDGEOPS_LIVE_CODEX=1` 會真正呼叫 Codex 三次、消耗訂閱額度，驗證調查／審查結果經真實 API 存入 DB。CLI schema 驗證失敗只輸出欄位位置，不印出密鑰或 prompt。

部署是新增四張表的 additive migration；API 啟動自動 migrate deploy。回復舊版本前先停止派工與本機 runner，舊程式可忽略新表；不要為回復程式刪除報告資料。沒有變更 judge 判題與付款路徑。

參考：[Codex 非互動模式](https://learn.chatgpt.com/docs/non-interactive-mode)、[Codex 登入](https://learn.chatgpt.com/docs/auth)。
