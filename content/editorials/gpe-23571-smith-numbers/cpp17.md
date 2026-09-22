digitSum 只用除十與取餘數累計數位。smith 中 remaining 可改變，但 value 保留原數，最後才用它計算待比較的數字和。count 計算全部質因數份數，而非不同質因數種類，所以四的 count 是二。

for 條件使用目前 remaining 的平方根界限；每次找到因數便反覆除掉，最後剩餘若為一就不再加項。主程式在第一次檢查前先 ++value，確保題目「larger than n」的嚴格性。每筆查詢互相獨立。
