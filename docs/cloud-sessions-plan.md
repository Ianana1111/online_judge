# 雲端 Claude 工作計畫（2026-10-30 ～ 2026-11-04）

這份文件同時給擁有者和雲端 Claude session 看。擁有者用它了解雲端在做什麼；每個雲端 session 開始工作前必須讀完「共同規則」和自己負責的工作線。

## 為什麼這樣分工

- 雲端 session 拿到的是 GitHub 上的快照，擁有者本機會持續修改，所以只交給雲端**不會跟本機工作重疊、可以獨立完成**的工作。
- 每條工作線負責固定的檔案範圍，五個 session 同時跑也不會互相衝突。
- 每個成果都是一個獨立的 PR，擁有者看過、CI（`Launch readiness` 的 `verify` job 會在 PR 上執行）通過後才自己 merge。雲端不 merge、不部署。
- 雲端加碼額度在 2026-11-04 23:59 PT 到期（台灣時間 11/5 15:59 左右），每條工作線的待辦都排得比五天做得完的還多，做完一項就接著做下一項。

## 共同規則（每個 session 都必須遵守）

### Git 與 PR

1. 先讀完本文件和 `README.md`。本文件只存在 `cloud/plan-20261030` 分支；**實際工作分支一律從最新的 `origin/main` 開**：
   ```bash
   git fetch origin main
   git checkout -b cloud/<工作線代號>-<主題> origin/main
   ```
   例如 `cloud/ops-lease-tests`、`cloud/web-workspace-a11y`。
2. **絕對不要 push 到 `main`**。`main` 一更新就會部署到 Railway 和 Vercel 正式站。不要 merge PR、不要 force push、不要刪除分支。
3. 一個 PR 只做一個主題，盡量控制在好審查的大小（原則上 diff 500 行以內，題解內容批次除外）。做完一項就開 PR，再從 `origin/main` 開新分支做下一項，不要把所有東西塞進同一個 PR。
4. PR base 是 `main`。PR 標題用英文、沿用 repo 的 commit 風格（`feat(web): ...`、`fix(ops): ...`、`test(api): ...`、`perf(web): ...`）。PR 內文用繁體中文，包含：做了什麼、為什麼、怎麼驗證（貼實際指令和結果）、風險與擁有者需要注意的地方。
5. Commit message 用英文、小寫開頭、沿用既有風格。**不要加任何 Claude／AI 署名**：不要 `Co-Authored-By: Claude`、不要 "Generated with Claude Code"，PR 內文也一樣。
6. 雲端的 `gh pr`、`gh issue` 子指令會被擋（它們走 GraphQL）。開 PR 用內建的 GitHub 工具，或 `gh api repos/Ianana1111/online_judge/pulls -f ...`。

### 安全與範圍

- 沒有正式環境的密鑰，也**不要嘗試連線**到正式的 Railway、Vercel、GCP、Stripe、ECPay、Codex 或 UVa 帳號。不要真的呼叫付費模型或外部付款 API。
- 隱藏測資刻意不在 repo 裡（見 `scripts/audit-project-data.ts`），不要捏造或推測隱藏測資，也不要把任何測資內容寫進 repo。
- **不要修改**付款、登入、權限與密鑰相關的正式程式：`apps/api/src/billing/**`、`apps/api/src/auth/**`、Stripe／ECPay 相關檔案、`apps/web/app/upgrade/**`、`apps/web/app/pricing/**`、部署設定（`docker/**`、`.github/workflows/**` 的 deploy gate、Railway／Vercel 設定）。可以為它們**補測試**或**寫問題報告**（放在 PR 內文或 `docs/cloud-findings/` 下），由擁有者決定要不要改。
- 盡量不要新增 Prisma migration。正式 API 部署時會自動跑 migration。真的需要時只能 additive（不刪不改既有欄位和資料），並在 PR 標題加上 `[needs owner review: migration]`。
- 不要改既有測試的預期結果來讓測試通過。修 bug 要先寫一個在舊程式會失敗、新程式會通過的測試。
- 擁有者本機正在處理以下檔案，**不要碰**：
  - `content/editorials/uva-10125-sumsets/`、`uva-10154-weights-and-measures/`、`uva-10436-cheapest-way/`、`uva-10665-diatribe-against-pigeonholes/`、`uva-10696-f91/`、`uva-10935-throwing-cards-away-i/`
  - `packages/db/scripts/seed-cpe-sitting.ts`、`scripts/editorials/export-snapshot.ts`、`scripts/editorials/oracles/cpe_sitting_20261006.py` 及其測試
  - 任何 CPE 2026-10-06 場次的題目

### 驗證

雲端 VM 是 Ubuntu 24.04、4 vCPU、16 GB RAM，已裝 Node 22、pnpm、Python、Docker、PostgreSQL 16、Redis 7。開 PR 前至少跑：

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm typecheck
pnpm lint
pnpm test
```

需要資料庫測試時，用 `docker compose -p oj-test -f compose.test.yml up -d --wait`（或 `service postgresql start` / `service redis-server start` 搭配 README 的連線設定），然後 `pnpm --filter @oj/db exec prisma migrate deploy`，再以 `RUN_DB_TESTS=1` 跑相關測試。改到前端時跑 `pnpm --filter @oj/web build`。Playwright 瀏覽器在雲端不一定裝得起來；裝不起來就在 PR 內文說明，交給 PR 上的 CI 執行，不要宣稱 E2E 已通過。

PR 內文只寫實際跑過的結果。跳過的檢查要明講是跳過，不能算成通過。

### 工作方式

- 可以用 subagent 平行調查不同模組，但每個改動都要自己讀過、驗證過再提交。
- 每條工作線的待辦依優先順序排列，做完一項就接著做下一項，直到全部做完或 session 被擁有者停止。做完所有待辦後，可以在自己的檔案範圍內繼續找有價值的改進，但不要擴到別條工作線的範圍。
- 每完成一個 PR，在對話裡回報一行：PR 連結、做了什麼、驗證結果。

## 工作線

### OPS：JudgeOps 優化

範圍：`apps/ops-monitor/**`、`apps/ops-runner/**`、`apps/api/src/agent-ops/**`、`apps/web/app/admin/agent-ops/**`、`packages/shared/src/opsWorkflow.ts`、`scripts/operations/**`、相關測試（`tests/agent-ops*`、`tests/ops-*`、`tests/e2e/agent-ops.spec.ts`）、`docs/judgeops*.md`。

先讀 `docs/judgeops.md` 和 `docs/judgeops-workflows.md`。不能呼叫真的 Codex（不要設 `JUDGEOPS_LIVE_CODEX=1`），不能部署 GCP。

1. **測試補強**：盤點 lease 續約／過期、receipt 去重、取消後晚到結果、重送 ACK、每日上限、advisory lock 序列化等邊界情況，補上目前缺的單元測試與資料庫整合測試（`RUN_JUDGEOPS_DB_TESTS=1`，資料庫依文件指定的 `127.0.0.1:56432` / `57379`，在 VM 內自己起）。
2. **評估情境擴充**：EVALUATE 目前只有 24 個合成情境，而且三種方法都 24/24。設計更難、更貼近真實的情境（多重故障、資料缺失、時間邊界、提示注入變形、互相矛盾的證據），讓評估真的能分辨方法優劣。只新增情境與評分程式，不跑模型。
3. **監控探測強化**：檢查 `apps/ops-monitor/src/probes.mjs` 的探測項目、逾時、重試和誤報條件，補足缺漏的檢查（例如判題延遲、SSE 串流、題目頁）。一律用可離線測試的方式實作並附測試。
4. **後台體驗**：`/admin/agent-ops` 的資訊架構、事件時間軸、證據閱讀性、手機版排版、空狀態和錯誤狀態。只動 agent-ops 頁面。
5. **Runner 可靠性**：`apps/ops-runner` 的錯誤分類、重試與 backoff、日誌結構、設定驗證、啟動自檢。不改模型、權限與 sandbox 的安全界線；如果覺得界線本身有問題，寫成報告。
6. **文件一致性**：對照程式碼修正 `docs/judgeops*.md` 中已過時或互相矛盾的描述，補一張目前完整架構與資料流的圖。

### WEB：前台網站升級

範圍：`apps/web/**`，但不含 `apps/web/app/admin/agent-ops/**`（屬於 OPS）、`upgrade/`、`pricing/` 以及登入／註冊／MFA 的表單邏輯。可以改樣式與無障礙屬性，不改這些頁面的流程。

1. **效能**：量測 `pnpm --filter @oj/web build` 的各頁 bundle 大小，找出過大的 client component、可以改成 server component 或延遲載入的部分（編輯器、圖表等），降低首頁、題目列表和題目頁的 First Load JS。PR 內附前後數字。
2. **題目練習工作區**：題目頁的閱讀、提交、看結果流程。找出卡住使用者的地方（狀態不明、錯誤訊息不清楚、鍵盤操作、手機版版面），逐一改善。
3. **無障礙**：對主要頁面做系統性的無障礙檢查（標籤、對比、焦點順序、landmark、`aria-live` 的判題結果通知），修正問題並補測試。
4. **SEO 與分享**：題目頁、題解頁、考古題頁的 metadata、結構化資料（JSON-LD）、`sitemap.ts`、canonical、OG 圖。不要改題目標題格式（commit a6ce2ae 剛調整過，保留題號）。
5. **學習體驗**：題目列表篩選、個人進度、題解導覽、考試模式等頁面的使用流程與視覺一致性。改動要克制，維持既有設計語言與深色預設主題。
6. **錯誤與載入狀態**：各路由的 `loading.tsx`、`error.tsx`、空資料狀態是否一致、有沒有閃爍或版面跳動。

### QA：測試穩定性與 CI

範圍：`tests/**`（OPS 範圍的測試除外）、`vitest.config.mts`、`playwright.config.ts`、`.github/workflows/readiness.yml` 中**不影響 deploy gate** 的部分、`scripts/test-api-runtime.mjs`、`scripts/serve-test-api.mjs`。

`verify` 這個 job 名稱是 Railway／Vercel 的部署門檻，**不能改名、不能拆掉、不能讓它變寬鬆**。

1. **Stripe webhook race 的 flaky test**（commit 6e6c211 曾因此重跑 CI）：在 VM 裡反覆執行找出原因。如果是測試本身的時序問題就修測試；如果是正式程式的 race，寫報告並附重現測試，不要直接改 billing 程式。
2. **其他 flaky 測試**：對 `pnpm test` 和資料庫測試做多次重複執行（例如 `--repeat` 或迴圈 10 次），列出不穩定的測試並修正。
3. **CI 速度**：在不降低檢查內容的前提下縮短 `verify` 的時間（快取 Prisma／Playwright 瀏覽器、Docker layer cache、平行化不互相依賴的步驟）。PR 內附預估或實測的前後時間。
4. **測試覆蓋盤點**：找出 `apps/api`、`apps/judge`、`packages/shared` 中沒有測試的重要邏輯，寫一份清單放在 `docs/cloud-findings/test-coverage.md`，交給 API 工作線參考。

### API：後端與判題的穩健性

範圍：`apps/api/src/**`（不含 `billing/`、`auth/`、`agent-ops/`）、`apps/judge/**`、`packages/shared/src/**`（不含 `opsWorkflow.ts`）、對應的新測試檔。

1. **找 bug**：系統性地讀 submissions、runs、contests、problems、leaderboard、notifications、community 等模組，找出邊界錯誤、競爭條件、權限漏洞、錯誤處理缺漏。每個確定的 bug 都要有會失敗的測試再修。不確定的列在 `docs/cloud-findings/api-review.md`。
2. **查詢效能**：找出 N+1 查詢、缺索引、一次載入過多資料的 API（排行榜、題目列表、個人頁、即時動態）。改查詢不需要 migration 的直接改；需要新索引的寫在報告裡，或開標 `[needs owner review: migration]` 的獨立 PR。
3. **判題 worker**：`apps/judge` 的重試、逾時、callback 失敗處理、checker 邊界（浮點、空白、特殊判題），補測試。不改 sandbox 的隔離設定。
4. **輸入驗證與錯誤訊息**：API 的 schema 驗證是否一致、錯誤回應格式是否統一、有沒有把內部錯誤細節漏給使用者。
5. 參考 QA 工作線產出的 `docs/cloud-findings/test-coverage.md`（如果已 merge 或在 PR 中），補上重要邏輯的測試。

### EDIT：題解內容品質

範圍：`content/editorials/**`（不含上面列出的進行中題目）、`docs/editorial/**`。不改 `scripts/editorials/**` 的程式，除非是修一個明確的 bug 並附測試。

1. 跑 `pnpm check:editorials` 和 `scripts/editorials/` 內的審查工具（先讀它們的用法與限制），把找到的問題分批修正。
2. **中英一致性**：比對每題 `editorial.md` 與 `editorial.en.md`、各語言解說的 `.md` 與 `.en.md`，修正翻譯缺漏、意思不一致、格式錯誤。
3. **解說品質**：檢查複雜度分析、邊界條件說明、常見錯誤段落是否正確且完整；四種語言的參考解法與解說是否對得上。只改說明文字，不改參考解法程式碼（程式碼已經過驗證）；如果認為程式碼有錯，列在 `docs/cloud-findings/editorial-review.md`。
4. 每個 PR 處理一批題目（例如 20～40 題），PR 內文列出題目和修正類型。

## 擁有者的操作

- 進度：在 <https://claude.ai/code> 看各 session；PR 列表看 <https://github.com/Ianana1111/online_judge/pulls>。
- 想補充指示：`claude -p "訊息" --cloud <session-id>`，或直接在網頁上回覆。
- 審查：讀 PR、確認 CI 通過後再自己 merge。merge 到 `main` 就會部署，建議一次 merge 一個，觀察正式站沒問題再 merge 下一個。
- 額度：加碼額度用完後，雲端 session 會改扣方案的一般用量。到 claude.ai 的用量頁面確認餘額，額度快用完時在網頁上停止或封存不需要的 session。
