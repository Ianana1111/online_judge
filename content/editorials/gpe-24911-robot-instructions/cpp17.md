movement 開 n+1 格，直接保留題目一至 n 的編號，索引零不使用。讀到 SAME 後再讀 as 與 previous 兩個 token；previous 指向的值已經是 −1 或 +1，因此不需要另外分支處理連鎖引用。

position 的更新放在三種指令共同的尾端，確保每條恰好執行一次。while(tests--) 內宣告 position 和向量，每組都有獨立初始狀態。最後只輸出最終位置，不印出中途軌跡或指令數。
