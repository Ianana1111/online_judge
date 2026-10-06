# JudgeOps 工作流程（2026-10-06）

此文件描述本次實作；部署與驗收的實際結果以文末清單為準。後台入口 `/admin/agent-ops`，只有 ADMIN 可用。

## 架構

- GCP Cloud Scheduler 每 5 分鐘呼叫私有 Cloud Run writer；writer 探測首頁、API、題庫、考試目錄、方案、Google 登入導向和訪客詳解權限。只保存狀態／延遲，不保存回應內容、OAuth state、cookie、IP 或個資。
- 狀態存 GCS 私有 bucket，使用 generation compare-and-swap；不同 writer 不會互相覆蓋新樣本。連續兩次失敗建立事件，連續兩次健康才恢復；超過 15 分鐘未更新標示過期。
- 另一個公開唯讀 Cloud Run reader 顯示狀態，沒有寫入 bucket 的權限。主站/API/資料庫/本機都停止時，此頁仍可用。Google Cloud Monitoring 從外部探測 reader `/status`，建立 alert policy，沒有擅自新增信件通知收件人。
- Railway API 保存調查、工作佇列、交接、lease、驗證結果和核准紀錄。Mac Codex executor 順序領取工作；同時最多一個工作／調查。
- 所有模型固定 `gpt-6-sol`、reasoning `high`、ChatGPT 登入；不支援強模型或 API key fallback。模型只有結構化輸入與 JSON 輸出，工具、shell、plugins、hooks 都關閉。

## 工作種類

### VERIFY

每天台灣時間 08:00 後排一次。Mac 在線且派工開啟才執行，非準點完成保證。拉取主分支到獨立 worktree，以該 commit 建立可信驗證映像。

隔離環境使用 PostgreSQL／Redis 暫存資料，沒有外網、正式密鑰、Docker socket，非 root，限制 CPU、4 GB 記憶體、pids、輸出及時間；工作目錄使用可回收磁碟 volume，RAM tmpfs 512 MB，執行完清理匿名 volumes。執行 migration、單元／資料庫測試、lint、四個應用型別、API build、HTTP 業務驗收及核心 Playwright。

正式 canary 使用可信主分支的固定 Collatz 程式，四語言各跑 sample 與小型判題案例，加上已知 WA／CE，最多 10 次 Vercel Sandbox。讀取公開題目；不建立使用者、提交、付款或排行榜紀錄。共用正式 Redis Sandbox 容量限制。這驗證判題核心，並非全站 430 題測資審核，也不等同真實使用者提交 API 壓測。

Google 真人 OAuth、實際扣款、外部信箱收件會明確標示 SKIP；隔離測試只驗證相關應用程式邏輯，不能證明外部交易完成。

### REPAIR

管理員提供具體重現方式與 1–4 個現有來源檔。只允許應用程式路徑，拒絕編排控制程式、部署設定、密鑰、migration 等檔案。

1. 工程代理收到受限來源及 SHA256，提出完整檔案替換和一個回歸測試。
2. 測試必須在原版產生 assertion failure，在修復版全部通過；語法錯誤／匯入失敗不算有效重現。
3. 修復後再執行完整隔離測試。
4. QA 和 Security 各自審查原始檔、diff、測試及結果。
5. 三個模型呼叫與所有硬性 gate 通過後，受信任執行器建立 `judgeops/<task-id>` 分支與 PR。AI 本身沒有 GitHub 憑證或工具。
6. API 不接受空白或缺少 regression-proof、full-suite、qa-review、security-review 的 READY 結果。

這是有限範圍修復，不是無限制自動重構。測試及模型審查不能證明程式永遠沒有漏洞，管理員仍應閱讀 PR。

### RELEASE

管理員在後台勾選確認後核准，API 綁定結果雜湊、base SHA、head SHA 和 patch SHA256，只建立一個發布工作。

受信任 adapter 再查 GitHub PR、head、parent、patch 和允許路徑。main 若已變更就停止，必須重新修復／驗證。變更前先保存 Railway API／judge 與 Vercel 的部署 ID。以非 force fast-forward 更新 main，等待受到修改影響的服务自動部署精確 SHA，再 promote Vercel，查核正式 worker 心跳／Sandbox 狀態，並做兩次公開探測。

驗證失敗時，只有 main 仍等於本次 head 才建立恢復原程式樹的 revert commit、還原保留部署，等待復原建置並再次探測。無法確認復原、主分支有別人更新、或租約中斷時標示 NEEDS_INPUT，不覆寫其他更新、不盲目重播。

依賴 GitHub → Railway/Vercel 自動部署設定，以及目前服務部署保留政策。`[skip ci]` 不會代替本機驗證。沒有資料庫 schema 修改，因此自動 rollback 不負責逆轉資料或金流。

### EVALUATE

兩個合成情境比較固定規則、單代理、三角色交接。最多 8 次模型呼叫，共占 3 份每日 AI 工作額度。記錄路由判斷、引用有效性、耗時和輸入／輸出 tokens。

2026-10-06 實測：三種方法都是 2/2 正確、2/2 引用有效。單代理合计 28.993 秒／17,138 tokens；三角色 71.394 秒／51,666 tokens；規則不呼叫模型。只有兩個樣本，不能推論正式準確率、修復成功率或多代理的普遍優勢。

## 啟用

- Railway API：`AGENT_OPS_WORKFLOWS_ENABLED=true`、`AGENT_OPS_AUTO_VERIFY=true`。
- 本機 `.env.local`：`JUDGEOPS_WORKFLOWS_ENABLED=true`，`JUDGEOPS_RUNTIME_DIR` 指到本專案 `apps/ops-runner/runtime` 的絕對路徑。保留 mode 600，勿提交 Git。
- 固定 `JUDGEOPS_CODEX_MODEL=gpt-6-sol`。
- 需要本機 Docker、Railway、Vercel、GitHub credential helper 和已登入 ChatGPT 的 Codex。`node scripts/operations/install-judgeops-launchagent.mjs` 安裝／更新啟動器。
- GCP 部署：先 `gcloud auth login`；執行 `node scripts/operations/deploy-ops-monitor.mjs` 查看資源，再加 `--apply`。預設為目前正式 Google 登入所屬的 project `cpe-judge`（project number `799346221691`），region `asia-east1`。部署前會確認專案可存取、狀態 ACTIVE 且已啟用計費；腳本只上傳 monitor 源碼。可用 `JUDGEOPS_GCP_PROJECT` 明確覆寫部署專案。
- 設定 Railway `JUDGEOPS_MONITOR_URL` 為生成的 reader URL。部署資料保存在 gitignored `generated/judgeops/gcp-monitor.json`。

## 中斷與稽核

- lease 180 秒，每 30 秒續約；任務期限一小時。遺失租約的修復／發布暫停，不自動重試外部副作用。
- progress 交接按 sequence 冪等接收。JSONB 比對使用結構相等，避免鍵順序差異誤拒絕重送。
- complete ACK 可重送但不重跑模型。結果先存本機 `runtime/result-<id>.json`；測試記錄在 `runtime/artifacts-<id>`，報告列 SHA256。
- PAUSED／NEEDS_INPUT：先核對最後檢查點、GitHub 分支／PR、目前部署和本機結果，再決定取消／建立新工作。沒有一鍵忽略驗證的發布入口。
- 本機睡眠會停止執行。獨立 GCP 監控不依賴 Mac；Railway API 內的每日排程仍依賴 API 和 DB。
- 暫存工作目錄、映像及 artifacts 會使用磁碟；不要把整個 repo 的 generated/.env/node_modules 帶進隔離候選檔案。只清理確定已結束的 JudgeOps 產物，勿刪開發資料 volumes。

## 驗收紀錄

已通過：20 項 worker／monitor／release 單元測試；15 項專用 PostgreSQL 測試（分批）；HTTP authentication／ADMIN／CSRF／revocation；6 項桌機手機後台測試；四語言正式核心 10 項 canary；固定 Sol/high 的 8 次 eval。

隔離容器內 migration、既有全套單元／DB測試、lint、型別、API build、HTTP 業務流程通過。已改用正式版離線建置與真實字型，容器內 52 項桌機／手機瀏覽器流程全数通過，memory.events 無 OOM。429 項一般測試通過，81 項依環境條件跳過；專用工作流程 PostgreSQL 15 項另外執行並通過。新工作流程 HTTP 的領取、交接、完成、精確核准、CSRF 也通過合成驗收。

實際隔離容器亦完成合成修復演練：同一個回歸測試在原版產生 1 個 assertion failure、0 個 runtime errors，套用修復後 1/1 通過。演練沒有更動正式程式或建立示範 PR。

2026-10-06 已部署前端、API、judge 和 migration，啟用每日巡檢與本機常駐執行器。正式工作 `cmuvjzfc60002wto7o0f9do01` 已實際完成雲端領取、lease 續約、隔離測試、四語言 canary 及結果回寫，結果 PASS；驗證來源 `e3439d841198f943f6183785abb8febb1ee1a68f`。包含 52 項瀏覽器流程，記憶體紀錄沒有 OOM。8 次模型的部署前實測已標明來源匯入後台，沒有為了填充報表而重跑模型。

首次映像建置遇到 Debian 套件下載緩慢，因此重用先前已驗證的依賴，清除舊應用來源後，以該版本的 Git archive 重建、核對 frozen lockfile，並逐一比對 1,053 個應用／測試／腳本檔案 SHA256，全部相符。來源比對、建置紀錄和正式工作報告保存在 `generated/judgeops`。啟動器亦加入短暫重試，處理 macOS 卸載舊程序尚未結束的競爭情況。

GCP 登入已恢復，確認 `cpe-judge` 就是正式 Google 登入專案；原預設 `black-agility-476214-s6` 不在目前帳號的存取範圍。`cpe-judge` 尚未啟用計費，仍需指定並連結計費帳戶後才能部署獨立監控，不能宣稱已上線。發布／rollback 已測試模擬故障、競爭更新及中斷，正式 provider 的版本讀取、GitHub 寫入權限及網站／worker 健康探測已核對。尚未故意對正式站製造故障來測試 rollback，第一次真實修復仍須在後台閱讀 PR 並核准。部署結果另記在 generated/judgeops。

部署前備份：`generated/backups/judgeops-workflows-before-20261006.dump`，51,413,521 bytes，PG18 自訂格式，297 筆 catalog entries，權限 0600。已驗證 dump/catalog，未執行還原演練。
