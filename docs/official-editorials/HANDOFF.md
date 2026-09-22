# 430 題官方詳解與測資驗證交接

更新日期：2026-09-22 14:53（台北）。本文件供同一工作區的後續 agent 接手。最新機器驗收結果以私人 `generated/editorial-audit-20260921/release.json` 為準，公開摘要見 [STATUS.md](STATUS.md) 與 [inventory.json](inventory.json)。

## 目前做到哪裡

- 430 題均已撰寫繁體中文官方詳解、完整可提交程式、程式解釋及逐題驗證計畫；尚未正式發布。
- 原本 68 題沒有本地隱藏測資，現在全部補齊。提案共 430 筆範例、1,744 筆隱藏案例，合計 2,174 筆；一個案例檔內可能有多組輸入。
- Docker 與 Vercel 的全量評測及兩環境真實 Run／Submit 處理器測試均已通過。18 題因詳解文字修訂而需要的 Vercel 補驗也已全部完成；14:52:53 的最終門檻為 **430 ready、0 pending**。沒有執行中的驗證工作，也沒有等待使用者 input。
- 81 個獨立 oracle 家族已重算全部 430 題、2,174 筆案例，逐筆比對輸入規格、輸入雜湊與答案雜湊。
- 題目頁官方詳解分頁、API 權限、資料版本、不可變詳解版本、交易發布工具及舊 seed 防覆蓋機制均已實作並測試。
- 本輪工作仍在 dirty worktree：**未 commit、未 push、未部署、未套正式 migration、未修改正式題庫、正式詳解發布數為 0**。

## 使用者已經決定的事項

1. 超大規模題目先實測，在題面清楚標示平台可承受的輸入／答案限制，再按新規格完整驗證。不要再詢問相同選擇。
2. UVa 1234 RACING 修正平行道路測資，維持簡單無向圖與至少三條道路形成環的規則。
3. 本次 430 題的私人測資、答案、參考程式與錯解可傳至既有 Vercel Sandbox，使用者接受執行費用。不是等待使用者提供 input。
4. 目前續作重點是把測資與最終版本驗證完成。發布與部署的先後順序見下方；不得把離線驗收描述成已上線。

## 可作為真實依據的檔案

| 用途 | 路徑 |
|---|---|
| 唯一詳解及程式來源 | `content/editorials/<slug>/` |
| 驗證與發布工具 | `scripts/editorials/` |
| 獨立答案方法與單元測試 | `scripts/editorials/oracles/` |
| API 讀取與權限 | `apps/api/src/problems/editorials.service.ts` |
| 題目頁詳解 UI | `apps/web/components/OfficialEditorialPanel.tsx`、`ProblemView.tsx` |
| 詳解 schema 與證據 schema | `packages/shared/src/editorial.ts`、`editorialEvidence.ts` |
| API／worker 共用評測支援名單 | `packages/shared/src/judge.ts` |
| checker 實作 | `apps/judge/src/local/checkers.ts` 及同目錄各專用 checker |
| additive migration | `packages/db/prisma/migrations/20260921010000_official_editorials/` |
| 舊 seed／並行新增保護 | `packages/db/scripts/testcase-seed-helper.ts` |
| 實作問題與修復沿革 | [ISSUES.md](ISSUES.md) |
| 完整驗證／部署操作 | [OPERATIONS.md](OPERATIONS.md) |

每篇目錄包含 `meta.json`、`editorial.md`、參考程式及對應 `.md` 解說、`verification.json`；需要修正題面時另有 `statement.md`。顯示、複製與實際判題都使用同一份參考程式，不能另外維護展示用副本。

私人 `author-*.py` 是早期製作工具，部分尚未包含後續修復，**不要重新執行來覆蓋 canonical 內容**。以 `content/editorials/` 與已驗證 oracle 為準。

## 私人快照與證據位置

以下檔案被 Git 忽略，另一個 agent 若使用新 clone，不會自動取得；完整接手需沿用此工作區或另行保留私人證據。它們不能放入公開 Git 或前端靜態資源。

工作區：`/Users/liyichen/Desktop/WorkingBabe/Projects/online_judge`

私人證據根目錄：`generated/editorial-audit-20260921/`

| 用途 | 路徑（相對於證據根目錄，除非為絕對路徑） |
|---|---|
| 原始唯讀正式快照 | `/private/tmp/oj-editorials-20260921/content.json` |
| 最終提案快照 | `formatting_text/proposed-snapshot.json` |
| 全量 Docker、當前版本 | `current-baseline/<slug>.json`、`summary.json` |
| Vercel 全量結果 | `final-vercel-r2-00/vercel/`、`final-vercel-r2-01/vercel/` |
| 最後 18 題內容版本補驗 | `final-vercel-content-00/vercel/`、`final-vercel-content-01/vercel/` |
| 真實處理器證據 | `all-run-docker/<slug>.json`、`all-run-vercel/<slug>.json` |
| 最終 oracle 重算 | `final-oracle-<family>/corrected-oracle/oracle-report.json` |
| 430 題獨立驗證涵蓋核對 | `final-independent-coverage.json` |
| 題庫／歷屆關聯可評測性 | `final-content-readiness.json` |
| 最終發布證據門檻 | `release.json`（每題 `files` 指向被實際接受的證據） |
| 被接受證據的整體計數 | `final-validation-summary.json` |
| 早期詳細進度 | `HANDOFF.md`（追加式歷史紀錄，日期較新的段落優先） |

固定指紋：

```text
原始快照：1b44f681b41ecbc6547ea1560326087ca6284844b5dc97225490260261291a54
提案快照：5832bf899809eb22da53969ce753ebb12c511832b598df84a3aafa46ba0b5685
Judge：   a65e36e2f56fe46c3c9ec98f4a3c3ad6c1150cc95483843e3b360e149c0b01e6
```

Vercel snapshot 識別留在私人證據／環境設定。`/private/tmp/oj-editorials-20260921/with-vercel.py` 會讀取既有 Railway judge 設定，只把必要變數交給子程序，不列印 secrets。不要直接輸出 `railway variables --json`。

最終工作樹備份：`generated/backups/official-editorials-20260921/worktree-drafts-430-final.tar.gz`，雜湊與逐檔 manifest 存於同目錄 `worktree-latest.json`。此備份涵蓋 Git 修改／未追蹤但未被忽略的程式、詳解及文件；私人快照、隱藏測資與 Sandbox 證據仍在上述受限目錄，並不包含在這份工作樹備份內。

## 如何判讀通過

`EXECUTION_PASSED` 是逐題批次結果，不等於已發布。`verify-release.ts` 還會核對完整內容、來源、題面、測資、checker、工具鏈、oracle，以及兩環境的 Run 證據。最終應得到 **430 ready、0 pending**，狀態為 `VERIFIED_NOT_PUBLISHED`。

18 題補驗的原因是兩次繁體中文用字修訂發生在 Vercel 執行開始之後。程式、輸入、答案及驗證計畫沒有改動，但先前報告的 `editorialContentHash` 過期。Docker 與 Vercel 均已實際完成補驗，沒有手動修改舊報告指紋。

最終接受的每個環境各有 1,590 份候選程式、7,879 次逐筆案例執行；560 份預期正確程式全通過，1,030 份指定錯解均被至少一筆隱藏案例攔下。其中本輪逐題計畫有 868 個錯解變體與 34 個合法替代變體，均具備雙環境證據。每個環境另外完成全部 430 題的 Run／Submit 範例一致性。

初次八 worker 的 Vercel 批次遇過 HTTP 429，已停止並保留 SE 歷史報告。r2 改用兩 worker，已完整通過。不要把 `final-vercel-00` 至 `07` 的舊 SE 當作攔下錯解，也不要將舊批次通過數直接加總成不同題數。

`audit.ts --resume` 可能重用相同指紋但需要覆核的報告。若遇到 SE／429，保留舊報告，再對受影響題目使用新批次目錄重新執行；不要用相同失敗報告反覆 resume。

## 已通過的其他驗證

| 類別 | 結果／私人紀錄 |
|---|---|
| 草稿結構與變體預檢 | 430 份來源、902 個變體，`final-preflight.log` |
| Python oracle 單元測試 | 527 通過，`final-oracle-units.log` |
| 一般 Vitest | 227 通過、169 項 opt-in 未在此命令執行，`final-unit-tests.log` |
| 可拋棄 DB 整合 | 118 通過／17 files，`final-db-integration.log` |
| 型別／建置／相關 ESLint | `final-typecheck.log`、`final-build.log`、`final-lint.log` |
| 真實 HTTP API | `final-api-runtime.log` |
| Production Playwright | Chrome desktop／Android 4 通過，加 Firefox／WebKit／iPhone 6 通過 |
| Docker 隔離測試 | 16 通過，`final-isolation-docker.log` |
| Vercel 隔離測試 | 16 通過，`final-isolation-vercel.log` |

上表 log 均在 `/private/tmp/oj-editorials-20260921/`。不要把一般 Vitest 的 skipped 數寫成通過；DB、瀏覽器、Sandbox opt-in 有各自實跑紀錄。

真實 Run／Submit 證據使用正式編譯、執行與 checker 處理器，唯讀 DB lookup 改從快照取得、Sandbox 使用真實環境；它不是正式網站 HTTP／佇列的逐題端到端上線證明。

提案的離線 routing 檢查涵蓋 430 題及 114 場 CPE／GPE、738 個題目關聯。另有一筆 `PUBLIC` 類型、零題目的 `group-test-session`，不屬於歷屆測驗，未刪除或修改；歷屆頁依 CPE／GPE 類型篩選，API 也會拒絕開始零題測驗。

## 後續工作順序

1. 先讀 `release.json`，目前 430 題已全部驗證完成。只有 canonical 內容、程式、checker 或工具鏈變動時，才依指紋重跑受影響證據；不要重開一份相同的全量付費工作。
2. 若還有 pending，依逐題原因補齊真實證據；不得放寬 checker、刪除合法困難案例，或竄改報告來讓門檻通過。
3. 使用同一預定 Vercel snapshot 執行離線門檻：

   ```sh
   node --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/editorials/verify-release.ts \
     --original=/private/tmp/oj-editorials-20260921/content.json \
     --proposed=generated/editorial-audit-20260921/formatting_text/proposed-snapshot.json \
     --audit-root=generated/editorial-audit-20260921 \
     --out=generated/editorial-audit-20260921/release.json
   ```

   環境需提供 `JUDGE_SANDBOX_SNAPSHOT_ID`；此命令只讀本地證據，不連正式 DB、不建立 Sandbox。
4. `STATUS.md`、`BATCHES.md`、`inventory.json` 已更新為全數通過。私人 `update-progress.mts` 已加上 430 ready／0 pending 的斷言；未來使用它更新 inventory 後，需同步維護人工撰寫的狀態文件。
5. 部署階段先核對備份、commit 與目標環境，套用 additive migration，再部署支援新 checker 的 API／judge。
6. `publish.ts` 的預覽／發布每批最多 25 題，證據目錄須有 `docker/`、`vercel/`、`run-docker/`、`run-vercel/`、`corrected-oracle/oracle-report.json`。按 oracle 家族分批，使用 `release.json` 接受的檔案；不要把不同 oracle 偽裝成一份共同來源。
7. 逐批唯讀預覽通過後才進入發布交易；若正式內容與原始／提案指紋都不符，先調查衝突，不覆蓋使用者的新修改。發布後再做正式 API、詳解呈現與 Run／Submit 健康驗收。

本輪完整驗證能證明指定版本的案例、參考解、合法替代解與已知錯解表現符合要求；不能保證所有未見過的錯誤程式都會被攔下，也不是「網站絕對不會被駭」的證明。
