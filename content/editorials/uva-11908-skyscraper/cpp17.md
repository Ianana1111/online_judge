Advertisement 將輸入長度立即轉成不包含的 end，後面只處理半開區間。ends 與排序後 ads 一一對應。upper_bound 搜尋已處理的 i−1 張，回傳第一個 end>start 的位置，距離開頭的數量就是相容前綴長度。

best 比廣告數多一格，索引代表「考慮幾張」，所以 best[compatible] 可直接使用，不需再減一。每輪保留不選此張的 best[i−1]，再和選此張收益比較。案例編號從一開始，依題目輸出 Case k: profit。
