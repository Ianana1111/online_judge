frequency[b] 計錄需求為 b 的欄數，它的大小是 m+1，因為一欄最多有 m 格。excess 初始是所有欄下界總和，positive 是正下界欄數；answer 先納入 k=0。

每次進入新 k，先把上一步仍有超額的欄各減一，所以 excess-=positive。再將需求恰為 k 的欄從 positive 移除，供下一輪使用。prefix 加入排序後第 k 大列需求，與目前 excess 相加即是 F(k)。只保存最大值，無需保存格子、殘量網路或實際燈的配置。
