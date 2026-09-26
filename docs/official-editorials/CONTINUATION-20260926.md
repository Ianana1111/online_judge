# 四語官方詳解接續進度（2026-09-26）

**430／430 題已備齊 C11、C++17、Python 3、Java 17 原始碼，以及每份程式的中英文教學說明，共 1720 份解答。** 沒有仍缺語言的題目。`pnpm check:editorials` 驗證全部雙語內容與 902 個錯解／替代解控制的結構，零失敗。

**430 題已全部正式發布，2026-09-26 21:05 台北時間正式站驗收通過。** 正式 DB 的 430 份有效詳解／1720 份程式與 canonical 來源逐一吻合；17 項正式 API／權限檢查全部通過，臨時帳號已精確清理。沒有仍缺語言、待驗證或待發布的題目。原始碼已 commit／push：`718975d`（跳過 CI），API 與 Judge 已成功部署。

## 本輪已完成

- 補齊原本剩餘的四語版本，保留所有參考程式的明列標準標頭，不使用 `bits/stdc++.h`。
- 新說明逐題交代題意、關鍵觀察、解法推導、邊界與複雜度；精確幾何、金額與大整數不靠截斷或固定 epsilon 過測資。
- 81 組獨立 oracle 已以本次正式資料只讀快照重算，全部通過。
- Docker 的 430 題完整測資與錯解控制已全數通過；合併後仍使用 audit resume 重查最新內容／程式／工具鏈指紋。
- Vercel 各分批完整測資皆已跑完；歷史失敗報告保留。修正後成功證據另存 `resource-fix-*` 與 `python-compat`，最後集中到 `current-vercel`，不改寫舊報告的 hash。
- Docker 真實 Run／Submit handler 已涵蓋 430 題；最新 Keyboarding 修改有額外重跑。Vercel Run／Submit 也已補齊全 430 題，最新來源均通過最終發布核對。
- 最新工具／證據單元測試 37 項通過，隔離本機資料庫整合測試 18 項通過，涵蓋即時 Pro 權益、到期／免費封鎖、考試封鎖、版本與測資變更。
- Typecheck、本輪變更的 ESLint 與 API 建置已通過。
- 每個環境均有 2880 份候選程式、14401 次逐筆測例檢查：1850 份合法候選全數通過，1030 份指定錯解均被隱藏測資攔下。

## 本輪查出並修正的執行問題

- Production Sandbox 實際 Python 是 **3.9.25**。移除四份程式的 `int.bit_count()`，改成相容運算；修正版 Docker／Vercel 均有證據。
- Buying Coke、Subset Sum、How Big Is It、Alibaba：改善精確演算法的效能，未放寬測資或資源限制。Alibaba 原先超時的一萬點案例改為必要可達性剪枝，本機約 0.06 秒，完整 Docker／Vercel 通過。
- AGTC：Python 使用精確 Myers 位元向量，完整 Docker／Vercel 通過。
- Fire、License Plates、Divisibility：Java 重用連續緩衝區，避免多個大型測例配置尖峰；完整 Docker／Vercel 修正版通過。
- Formatting Text：Java 用精確的共享連續空格序列與完整鍵去重取代大量大整數後綴，保留全篇字典序與前綴平手規則，完整 Docker／Vercel 通過。
- Keyboarding：Python 合併等價游標位置，以 BFS 預算最短箭頭距離，再用字元段 DP，仍計入全部選取與 Enter。原 50×50／10000 字壓力案例本機約 2.24 秒；另與完整狀態 BFS 比對 10000 個隨機案例，全部一致。最新版本 Docker／Vercel 完整測資均通過。
- Roads in the North：四語均使用精確路長累加，C++ 保留原錯解控制位置並移除 64 位元總長溢位風險。

## 私有資料與證據位置

根目錄：`generated/editorial-audit-20260926/`，不可提交測資、答案、私有診斷或資料庫匯出。

- `current-snapshot.json`：430 題、115 場測驗，正式資料庫只讀匯出。
- Snapshot hash：`6ca46867a964636ad9d7b4af6ec84d47fde660068aaa0fc5ee32ba30f5c6fe9e`。
- `current-baseline/`：本輪 Docker 完整 audit。
- `current-vercel/`：本輪 Vercel 完整 audit。
- `all-run-docker/`、`all-run-vercel/`：實際 Run／Submit handler 的逐題報告，範例與提交分別使用獨立一次性 Sandbox。
- `independent-oracles/<family>/oracle-report.json`：81 組獨立驗證。
- `<family>/corrected-oracle/oracle-report.json`：相同原始 oracle 報告的發布佈局。
- `resource-fix-wave6/keyboard-random-crosscheck.json`：最新版 Keyboarding 的額外交叉驗證與程式 hash。
- `vercel-parts/`、`additional-four-language*`、`remaining-wave*`、`resource-fix-*`：歷史與補驗證原始證據。不要用手改 hash 冒充最新版。

## 備份與發布過渡

正式資料庫備份：`/private/tmp/oj-editorials-four-language-backup-20260926/before.dump`，50,159,565 bytes，SHA-256：`ee1bc5068184c54735378da29f617ccac8f1ec59b0e1f2e2ee71f827429c515b`。目錄 0700、檔案 0600；PostgreSQL 18 的 `pg_restore --list` 已成功驗證。最後內容封存已存為同目錄的 `final-four-language-content.tar.gz`，SHA-256：`7d00af4aac0f6b513a7ec4fe1cfafc127fdff71279d6bfa5d2279c2f187b1095`。

本輪 Judge revision 為 `0653a66f645c5cb090ca0bbe613b777de86fc1568a586dea30e6fec1e5cf428d`。前一版 `e6d221ab1c342e5b03144a9763eabe222c21cc8052e20defa9561afdaa338950` 的差異已從 Git 複查，只有 Sandbox 錯誤記錄，不涉及編譯、執行或 checker。

新增的讀取相容性只接受這組已審查的 logging 過渡，且仍檢查即時 Pro、題目測資版本與考試狀態。其他 revision 一律封鎖；未來 Judge revision 變更會自動失去本次例外。**發布閘門完全不接受舊 revision：新上架的每份程式仍需要最新完整證據。** 這能在部署與逐批發布之間保留既有詳解，不必讓全站暫時變成 REVIEW_REQUIRED。

## 已完成的發布步驟

1. Docker／Vercel 完整測資與 Run／Submit 全 430 題已完成。
2. 最終 `verify-release.ts` 已通過 `ready=430,pending=0`，結果存於私有 `release.json`。
3. 全部 `publish.ts` 唯讀預覽已通過，API 的 logging 相容過渡已成功部署。
4. `publish.ts` 已完成 430 題原子發布（最終續跑新發布 372 題，58 題由先前成功交易保留），每批最多十題，維持 live-state guard 與 Serializable。
5. 正式 DB 全量內容比對及 17 項 HTTP 驗收通過，臨時帳號已清理。結果存於私有 `production-acceptance.json`。
6. 主內容提交 `718975d` 已 push／部署（跳過 CI）；最終文件與發布工具優化另行提交。詳見 [發布紀錄](RELEASE-20260926.md)。

## 接續執行

- Audit：`node --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/editorials/audit.ts --snapshot=generated/editorial-audit-20260926/current-snapshot.json --out=<private> --only=<slugs> --backend=docker --resume`。
- Vercel 使用 `RUN_VERCEL_SANDBOX_TESTS=1 railway run --service judge --environment production --no-local ...`；測資上傳與 Sandbox 執行費用已有使用者授權。不得顯示環境憑證。
- Run 使用 `EDITORIAL_RUN_SNAPSHOT`、`EDITORIAL_RUN_OUT`、`EDITORIAL_RUN_ONLY`、`EDITORIAL_RUN_RESUME=1`，每批 15 題跑 `tests/editorial-run.pipeline.test.ts`。
- `/private/tmp/oj-parallel-run.py` 的四個程序互不重疊，共用 `all-run-vercel/` 的逐題檔案；選單在 `parallel-run-selection.json`，結果在 `parallel-<n>-summary.json`。原 coordinator 已停止，資訊在 `inflight-old-run.json`；其缺少完整證據的十題已另行補跑，最終全 430 題通過。不要重新啟動原 coordinator 造成重複。
- `/private/tmp/oj-collect-current-evidence.py` 只複製原始成功報告；仍必須跑 audit resume／發布閘門判斷是否過期。
- `verify-release.ts` 與 `publish.ts` 維持嚴格 oracle／judge／content／toolchain／Run／Submit 核對，不可為求完成而放寬。

## 本次發布執行器

- `/private/tmp/oj-preview-parallel.py`：四組唯讀預覽，`publication-preview.json` 已為 complete／430。
- `/private/tmp/oj-apply-parallel.py`：目前使用單一寫入程序、每批最多十題，仍呼叫正式 `publish.ts` 並維持 Serializable／即時指紋／證據／版本檢查。四組並行發布曾觸發 PostgreSQL Serializable 寫入衝突，失敗交易已回滾，沒有放寬隔離層級；改成序列續跑並保留全部成功／拒絕日誌。舊 coordinator 均在當前交易完成後停止。
- 發布結果：私有 `publication-apply.json`，`complete=true`、430 題；完成日誌為 `publication-apply-serial-resume.log`。逐批原始日誌保留於 `publication-evidence/`，正式 DB 全量核對也已通過，不只依據程序成功。
- `/private/tmp/oj-four-language-production-check.ts`：正式資料與 canonical 430 題比對，以及中英文四語、匿名／Free／Pro／到期／撤銷權限檢查；臨時帳號使用精確身分與建立時間清理。已執行通過，私有 `production-acceptance.json` 為 `passed=true,cleaned=true`。

發布 CLI 同一原始／提案快照只解析與計算一次指紋，減少大快照的重複工作；不同快照仍分別完整驗證。該工具的 TypeScript、ESLint 與 26 項發布閘門單元測試已通過。
