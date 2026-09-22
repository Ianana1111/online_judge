low、high、mid 都使用 long long，mid*(mid+1) 在寬整數型別內運算。若目前三角形數嚴格大於 sum，mid 已可能是答案，縮小 high；否則答案一定在右側，令 low=mid+1。

迴圈結束 low==high，即最小符合索引。missing 以完整和減去輸入和取得，沒有另做可能打亂唯一解的取整。零只用於結束，不輸出案例標題或空行。
