# 電子錢包方案評估

查證日期：2026-09-13。現況是綠界信用卡月／年自動續訂。此文件不代表 Apple Pay 已啟用，也不把延遲付款視為定期扣款。

| 方案 | 與目前產品的關係 | 實作及商家依賴 |
| --- | --- | --- |
| 綠界信用卡定期定額 | 維持目前續訂、取消、退款流程 | 完成商家控制的實卡首扣、續扣、取消與退款驗收 |
| 綠界 Apple Pay 單次購買 | 可另設不續訂的固定期間方案；不能直接代替現有訂閱欄位 | 後台申請資格、網域驗證、Apple Pay 裝置驗收、一次性訂單與權益處理 |
| 綠界站內付 2.0 | 包含 Apple Pay、信用卡定期定額及延遲付款等不同流程 | 新 SDK、交易 token、回呼與退款整合；不因清單有兩者就推定能用 Apple Pay 自動續訂 |
| TapPay | 可評估多錢包單次付款；一般記憶卡片續扣流程不能套用 Apple Pay | 新商家／收單合約、SDK、token 保管、退款與對帳；應先取得適用錢包續扣的書面規格 |
| iOS App Store 數位訂閱 | 若未來以原生 App 提供本產品數位功能，需要另外設計 StoreKit 與商店權益同步 | App Store Connect、交易通知、復原購買、退款與撤銷、依銷售地區適用的商店規則 |

綠界全方位金流的 Apple Pay 使用 `ChoosePayment=ApplePay`；站內付文件要求商家設定並驗證網域。信用卡定期定額及 Apple Pay 延遲付款在官方文件中是不同流程，因此目前不能確認商家的 Apple Pay 自動續扣資格。[全方位 Apple Pay](https://developers.ecpay.com.tw/7328/)、[站內付流程](https://developers.ecpay.com.tw/9035/)、[付款參數](https://developers.ecpay.com.tw/66689/)。

TapPay 的 Apple Pay 後端文件明列，一般 `remember=true` 取得卡片 token 再定期扣款的功能不支援 Apple Pay、Google Pay 等錢包。不可將搜尋摘要中「recurring transaction」片段誤讀成 Apple Pay 支援續訂。[TapPay 官方後端文件](https://docs.tappaysdk.com/apple-pay/en/back.html)。

App Store 的數位功能／訂閱需檢查應用內購買要求、跨平台存取與地區例外；Apple Pay 並不直接取代 StoreKit。這是未来原生 App 的上架設計事項，目前網站發布不需要先新增 StoreKit。[Apple 審查規範 3.1](https://developer.apple.com/app-store/review/guidelines/)、[Apple 自動續訂訂閱](https://developer.apple.com/app-store/subscriptions/)。

建議：先保留已驗證的信用卡自動續訂。若要先增加 Apple Pay，明確新增「單次購買、不自動續訂」商品，維持原訂閱商品的價格與條款。此為技術建議，尚未改變商品或收費。

開通前取得商家後台／合約的實際費率、固定費用、最低月費、退款費用、撥款時程及拒付規則；公開文件不足以確認本商家的報價，不填推估費率。供應商需確認單次或 recurring/MIT 能力、支援銀行、交易憑證生命週期、取消與退款冪等性。驗收需包含付款取消、裝置不支援、成功回呼遺失／重送、金額不符、退款、重複點擊與已存在信用卡訂閱時的權益重疊。
