先讀第一個元素放在 previous，後面每次讀 current 即可計算一個相鄰差值。判斷式先檢查小於一或大於等於 n，短路求值讓超界差值不會被用來索引 seen；只有合法且未見過才標記。

`good` 一旦變成 false 就不會再變回 true，但讀取迴圈仍繼續到 n 個元素全部耗盡。每輪最後更新 previous，下一次便會比較正確的相鄰兩項。n=1 時內層完全不執行，good 保持 true。輸出大小寫依題目使用 Jolly 與 Not jolly。
