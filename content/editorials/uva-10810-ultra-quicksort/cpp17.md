sorted 只負責數值壓縮，不改動原序列 a。lower_bound 的零起始位置加一，確保 Fenwick 更新 pos += pos & -pos 每次都能往上移動。

prefix 由目前排名向零走，將涵蓋前綴的區塊次數相加。i 是已處理元素個數，因此 i−prefix(rank) 正是比目前值大的數量。tree 每格最多 N，使用 int 足夠；所有位置的逆序總和則用 long long，避免只在最後輸出才轉型已經溢位的結果。
