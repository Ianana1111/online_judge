previous 初始化成 0、1、…、n，代表空來源的成本。每輪 current[0]=i 對應刪光來源前綴；j 從一遞增，所以 current[j-1] 已完成，previous 的兩個格仍是上一列。

比較 x[i-1] 與 y[j-1] 使用零基底索引，不和 DP 的前綴長度混淆。整列算完才 swap，使 previous 成為最新一列；current 裡舊值之後逐格覆寫。m=0 時外層不執行，previous[n]=n 自然是全插入成本。條件式讀字串保留零長度輸入的正確 token 位置。
