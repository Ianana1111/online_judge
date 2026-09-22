讀取 cumulative 時，先減 previous 求單列或單欄總和，再扣每格預放的一；previous 保存未修改的原累計值，否則下一次差分會錯。列與欄節點分別用零到 rows−1、rows 到 rows+columns−1，源匯放在最後。

edge[i][j] 對應列→欄容量十九的前向邊，最後用 1+initial−capacity 取回格值。Dinic 類別保留反向殘量與層級圖，能重新分配先前的列欄流量。每組依序印 Matrix test，後面恰好 R 行 C 欄；程式選擇組間空一行，checker 也接受沒有額外空行的合法格式。
