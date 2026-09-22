# 官方詳解的撰寫、驗證與發布

## 內容來源

每題的唯一內容來源在 `content/editorials/<slug>/`：

- `meta.json`：標題、語系、解法語言。
- `editorial.md`：題意、思路、推演、正確性、複雜度與常見錯誤。
- `cpp17.cpp`、`cpp17.md`：實際送交評測的程式與逐段解說。其他語言有對應副檔名，例如 10268 的 `python3.py`、`python3.md`，使用精確整數處理可能溢位的中間計算。
- `verification.json`：原始規格來源、輸入限制、獨立答案方法，以及應通過／應失敗的程式變體。
- `statement.md`（僅需修正題面時）：完整審查後題面，須由 `statementCorrection` 指定原題面雜湊、修正檔路徑、原因與官方來源。不得任意修改限制來讓程式通過。

讀取工具會從這些檔案組成 API 內容；不存在另一份手動複製的「展示程式」。解說章節、語言重複與欄位格式會先經 schema 檢查。

## 驗證順序

1. 以唯讀交易匯出正式題目、範例、測資、限制和考試關聯。備份與執行輸出只放 `generated/` 或私人暫存路徑，不提交 Git。
2. 由獨立 Python oracle 核對每筆輸入限制和答案。若需修正，先輸出包含原始輸入／答案 SHA-256 的提案，再用 `prepare-pilot.ts` 建立修正後快照；這個命令不連資料庫。
3. 執行 `audit.ts`，逐一跑完所有範例、全部隱藏測資，以及 Submit 的正式彙整判決。它不因第一個 WA 就跳過後面的案例。
4. 執行 `tests/editorial-run.pipeline.test.ts`，直接呼叫正式 Run 與 Submit 處理器；資料查詢取自快照，Sandbox 編譯、執行與 checker 使用真正實作。這是處理器證據，HTTP 與佇列另由 API 測試負責，不能混為一談。
5. Docker 提供無網路、無主機掛載的隔離 Linux 驗證；正式環境另使用同一個 Vercel snapshot。兩者的編譯器／環境識別都寫入報告，不把 Docker 性能當成 Vercel 性能。
6. 檢查瀏覽器分頁、行動版、鍵盤、複製、載入失敗、未發布、重新驗證及測驗封鎖。以真正 HTTP 路由確認快取與伺服器權限。

新增或修改草稿後，先執行 `pnpm check:editorials`，一次檢查所有草稿結構、程式說明、oracle 路徑及錯解替換位置，避免跑到批次中途才發現缺檔或過期變體。這個預檢不執行程式，也不代表評測通過。

常用命令（路徑以當次私人快照代入）：

```sh
node --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/editorials/audit.ts \
  --snapshot=generated/review/content.json --out=generated/review/docker \
  --only=problem-slug --resume

EDITORIAL_RUN_SNAPSHOT=generated/review/content.json \
EDITORIAL_RUN_OUT=generated/review/run-docker \
EDITORIAL_RUN_ONLY=problem-slug \
pnpm exec vitest run tests/editorial-run.pipeline.test.ts

pnpm typecheck
pnpm lint
```

外部驗證遇到 429 限流或 SE 時，保留失敗報告、降低並行量，重新建立沙箱驗證受影響題目；服務錯誤不能當作錯解被拒絕的證據。分批工作程序各自寫報告，完成後才產生全量摘要，避免多個程序覆寫同一份摘要。

`--resume` 只重用題目、完整候選計畫、詳解、oracle、評測程式與工具鏈都相同的報告。新增測資、修改程式或改動 checker 後，舊報告不能當成新版本的驗收結果。

`EDITORIAL_RUN_ONLY` 可以用逗號指定多題；省略時執行快照內全部已撰寫的詳解。指定不存在或沒有詳解的題目會失敗，不會悄悄略過。

題號相同不保證題目版本相同。10188 應依本站採用的 CPE 修改版比較全部可見字元並印出標準文字長度，不能套用 UVa 原版只比較數字的做法；10222 也需保留 CPE 的輸入組數。每篇審查計畫應列出實際採用的來源。

## 發布門檻

`publish.ts` 預設只做唯讀預覽。它要求 Docker、Vercel、兩種環境的 Run 證據、逐筆 oracle 證據，以及精確的程式／內容指紋。以下任一狀況都拒絕發布：

- 未執行全部案例、重複或缺少案例、編譯失敗、系統錯誤。
- 正解失敗、已知錯解仍 AC、尚待判斷的 OBSERVE 候選。
- 顯示程式與測試程式不同，或題意、測資、checker、資源限制、工具鏈已改變。
- 獨立 oracle 沒有核對目前每筆輸入及標準答案。

`verify-release.ts` 提供不連資料庫、不建立 Sandbox 的離線總檢查。它會讀取各批次已存在的證據，使用與發布命令相同的門檻，分別標記「證據完整但未發布」「缺少證據」與「需要覆核」。工具鏈識別必須與準備發布的 judge 設定相同；這個結果本身不證明網站已部署。

```sh
node --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/editorials/verify-release.ts \
  --original=generated/review/original.json \
  --proposed=generated/review/content.json \
  --audit-root=generated/review --out=generated/review/release.json
```

執行環境需提供 `JUDGE_SANDBOX_SNAPSHOT_ID`。目前資料夾約定是 `current-baseline/`、`current-vercel/` 或 `continuation-vercel/`、`all-run-docker/`、`all-run-vercel/`，以及各題群的 `corrected-oracle/oracle-report.json`。不同 oracle 的原始碼雜湊必須分別保存，不可合併後冒用同一個雜湊。正式 `publish.ts` 每批仍需傳入與該批 oracle 相符的證據檔案配置。

```sh
node --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/editorials/publish.ts \
  --original=generated/review/original.json \
  --proposed=generated/review/content.json \
  --evidence=generated/review --only=problem-slug
```

只有完整預覽通過後才加 `--apply`。命令以資料庫交易鎖定題目，再比對目前資料是否仍等於審查前或審查後版本。測資修正、明確審查的 checker／題面變更與新詳解版本一起提交；任何一題衝突，整批回復。題面必須逐位元等於指定修正檔，前值必須符合審查雜湊；其他限制變更仍拒絕。每批最多 25 題，重跑不會重複發布相同版本。

舊 `seedFromSample`／`appendTestCase` 在交易內先鎖定題目，再檢查是否已有驗證詳解版本；有任何版本（包含未發布或已取代）就拒絕直接寫入。題庫後續修訂須建立新證據並走受控發布流程，避免維護腳本回寫舊測資。

已發布詳解的內容與驗證資料不可覆寫，修訂必須建立新版本。題意、範例、測資或評測設定變更會由資料庫 trigger 增加版本，讀取 API 立即停止顯示舊詳解。評測原始碼指紋由回歸測試綁定；更新 Sandbox snapshot／編譯器時，部署人員也必須重跑驗證並更新詳解，不能僅沿用舊 snapshot 的成功報告。

## 部署順序

1. 建立最新備份，確認工作樹與預計部署的 commit。
2. **先套用新增欄位／詳解資料表的 additive migration，再啟動使用新 Prisma client 的 worker。** Railway API 與 judge 同時自動部署有先後競爭，不能依賴 API 恰好先跑完 migration。
3. 部署支援新 checker 的 judge 與 API，確認健康；此時先保留原本正式題庫設定。
4. 使用已通過的完整證據，執行逐批發布交易。UVa 100 的 SPECIAL 設定必須在支援它的程式部署之後才切換。
5. 確認正式 API／前端顯示已發布版本、驗證日期與正確程式，並做 Run／Submit 健康驗收。不要建立假使用者成績來湊驗證紀錄。

若要回復舊版 judge，必須先評估它是否認得已切換的 SPECIAL checker；不能單純退回 binary，卻保留舊程式不支援的題庫設定。所有回復以備份與明確前值比對進行，不執行全題庫 seed 重置。
