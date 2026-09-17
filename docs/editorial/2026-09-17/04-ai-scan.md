# 官方快報｜GitHub 放寬 AI Scan 啟用條件：PR 安全檢查往前一步

程式碼準備合併之前，多一道安全檢查就多一次提早發現問題的機會。GitHub 最新調整 AI Scan 的啟用條件，讓符合資格的專案更容易把檢查放進 PR 流程。

*judge. 官方快報 · 2026/09/17｜消息日期：2026/09/16*

## 新聞現場

GitHub 宣布，PR 的 **AI Scan 不再以啟用 CodeQL default setup 為前提**；code scanning 與 AI Scan 本身仍須開啟，原有權限層級也保留。這次調整處於公開預覽，適用於 github.com 上 GitHub Advanced Security 客戶的組織及個人儲存庫，**不支援 GitHub Enterprise Server**。[查看 GitHub 更新公告](https://github.blog/changelog/2026-09-16-code-scanning-ai-scan-no-longer-requires-codeql-default-setup/)

## judge. 觀點：把安全問題寫成可以驗證的條件

對學生專題或個人作品來說，可以先從最具體的問題開始：未登入的人能不能讀取私有資料？使用者改掉網址中的 ID，會不會看見別人的紀錄？同一個請求送兩次，會不會重複建立訂單？

把這些情境寫進測試，比只問「我的網站安全嗎」更容易追蹤改善。自動掃描能提供線索，但仍要由人判斷影響，並驗證修補結果；沒有警報也不能直接推論成沒有漏洞。這是本站對開發流程的建議，並非對 AI Scan 偵測能力的保證。

## 留給你的討論題

如果只能替自己的專題補一項安全檢查，你會先選權限驗證、依賴套件檢查，還是機密資訊掃描？說說你選擇的原因。
