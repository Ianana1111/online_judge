# 中英文教學詳解與 Pro 發布工作

2026-09-22：使用者要求全部 430 題改成循序教學的寫法，提供繁體中文、英文、通過 Judge 的共用參考程式，並只向有效 Pro 開放，完成後正式上架。

此工作接續 `485f6f6`；上一版 430 題中文草稿及程式已通過雙環境驗證，但不是本次雙語發布完成的證明。

## 2026-09-23 雙語內容完成

新的離線發布門檻已檢查 430 題：430 題全部完成中英文教學改寫、逐題審查及既有執行證據重新核對，待審題數為零。正式資料庫發布、應用程式部署與正式站驗收結果記錄於下方。

完整狀態與所用證據路徑保存在私人 `generated/editorial-bilingual-20260922/release.json`。430 題參考程式都與已執行的原始版本逐位元相同，沒有把翻譯日期冒充新的 Sandbox 執行日期。`pnpm check:editorials` 回報 430 份草稿、430 份雙語內容、430 份解答、902 個錯解變體且零失敗；`verify-release.ts` 回報 ready 430、pending 0。

已通過：一般 Vitest 236 項、詳解資料庫整合 17 項、實際 API HTTP 權限與雙語回應測試、桌面／手機瀏覽器 4 項，以及 TypeScript 與 ESLint。瀏覽器檢查包含中文／英文切換、複製原始程式、升級提示、測驗封鎖、閱讀途中到期、鍵盤操作、無水平溢出及 WCAG AA 對比；語言切換鈕的淺色對比問題已修正。

內容編寫階段已完成。每題都在讀取既有中文、程式與平台限制後撰寫，並以逐題審查證據鎖定同一份已通過 Judge 的程式；沒有只根據題名套用另一道同名題的解法。

後續每批使用 `review-content.ts --baseline=generated/editorial-bilingual-20260922/baseline --release=generated/editorial-audit-20260921/release.json --snapshot=generated/editorial-audit-20260921/formatting_text/proposed-snapshot.json --out=generated/editorial-bilingual-20260922/content-revisions --only=<本批題目> --reviewed` 保存實際審查。這個旗標是完成審查後的紀錄，不是自動審稿功能。

## 內容標準

每題要說清楚如何讀懂題意、最初能想到的做法、重複工作或失敗反例、關鍵觀察、解法的形成、具體範例、正確性與複雜度。程式解說放在後面，解釋變數和流程如何對應前面的想法。不能用相同的空泛前言填滿 430 題，也不能把英文題面當成英文詳解。

中文來源仍為 `editorial.md` 與 `<language>.md`。英文來源為 `editorial.en.md`（第一行 `# English title`）與 `<language>.en.md`。兩個語言只共用既有程式檔案，英文不能另外夾帶未評測的程式來源。

## 權限與前端

API 在讀取詳解內容前，查詢資料庫中的實際帳號權益。有效付費 Pro、既有學生 Pro 權益與管理員審稿權限可讀；匿名、免費、到期、退款失去權益的帳號不回傳內容。取消續訂但已付款期間未結束的帳號仍有權益。正在參加該題所屬測驗時繼續封鎖。

前端提供明確 Pro 提示與中英文切換，依使用者、語言及權益分隔查詢；API 回應不允許共用快取。頁面與 API 都不能在免費回應、SSR 初始資料或失敗回應中夾帶參考程式。

## 執行證據與文章修訂

原始內容已從 `485f6f6eb44c1cf336920ccfb795ff276e0bba4d` 匯出到私人 `generated/editorial-bilingual-20260922/baseline/`。原始 430 題通過證據仍在 `generated/editorial-audit-20260921/release.json`，不覆寫。

`review-content.ts` 在逐題教學覆核後保存修訂證據：先使用舊文章驗證完整舊評測報告，再逐位元比對新舊程式相同，最後將新中英文文章雜湊與審查紀錄綁定。題面、測資、checker、工具鏈、oracle 或程式有任何變化，都不能沿用這個純文章修訂流程。歷史報告不會被改成新文章的測試日期，也不宣稱翻譯文字本身被 Judge 執行過。

`verify-release.ts --content-revisions=<private directory>` 驗收新的雙語發布版本。`publish.ts` 必須看到中英文齊備，並驗證當前原始碼或合法的文章修訂證據，才可以發布。

## 正式發布與驗收

發布前以 PostgreSQL 18 建立正式資料庫備份 `/private/tmp/oj-editorials-prod-backup-20260923/before.dump`，檔案大小 27,629,186 bytes，SHA-256 為 `0d18a85ecf203009e79a905e0a4f56245b453cafc1e3ce6f6e385014ee992f42`；目錄權限為 `0700`、檔案權限為 `0600`，且已通過 `pg_restore --list`。工作目錄另存內容封存 `generated/backups/official-editorials-20260921/worktree-drafts-bilingual-430-final.tar.gz`，含 1,310 個檔案，SHA-256 為 `e4e331903e08c74c7ff0bb80e652f5e9b23de87c2594302c4c2f74ff2f875636`。

內容與程式 commit `3554dcb1b1b158192b63a170ec49b2c14c7f278a` 已推送到 `origin/main`。GitHub Actions Launch readiness run `35757340152` 全部成功，包含 236 項 Vitest、17 項詳解資料庫整合、33 項金流／退款整合、TypeScript、ESLint、API 與 Web build、實際 API runtime HTTP 測試，以及完整跨瀏覽器 Playwright 回歸。

正式應用程式部署完成：Railway API deployment `b1eb06d0-adbd-431b-942b-348d86605699`、Judge deployment `ee87d271-7a5e-465a-8ca7-8805d2b1386f` 均為 `SUCCESS`；Vercel deployment `dpl_Bke95xrseA2kmvcMwrQhqMaBu8AF` 為 `READY`，且 `judge.tw` 已指向該版本。

430 題依 81 個 oracle 群組逐批預覽並發布；三次暫時性批次錯誤均先重新預覽、確認完整後才重新套用，沒有留下半批寫入。正式資料庫發布後核對結果為：430 題、430 個唯一 slug、430 個目前發布版本、430 題中英文齊備，內容雜湊全數相符，Judge 版本全數仍為目前版本。

正式 API 已驗收匿名、Free、有效 Pro、英文、到期權限與私人快取；匿名與 Free 不會收到文章或程式碼，有效 Pro 可取得中英文內容與相同的已驗證程式，到期後立即阻擋，回應使用 `Cache-Control: private, no-store` 並依 Cookie 分流。

最後以全新臨時帳號在 `https://judge.tw/problems/uva-100-the-3n-1-problem` 實際驗收。匿名瀏覽器只顯示登入入口且 DOM 沒有程式碼；升級為 Pro 後，中英文標題、文章與參考程式均正確顯示，程式和已驗證來源逐字一致，桌面寬度沒有水平溢位。相同 C++17 程式經正式 Run 對輸入 `1 10` 輸出 `1 10 20` 且狀態為 `DONE`，再經正式 Submit 得到 `AC`。驗收帳號及其關聯資料已由具身分比對的清理程序刪除並確認不存在。

本次 430 題雙語官方詳解、Pro 權限、正式發布與 Judge 端到端驗收已全部完成。
