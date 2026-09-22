輸入的機率先保留成字串，再用 strtold 轉為 long double。檢查科學記號前的有效數字，可以區分數學上的零與小到浮點型別無法表示的正數；極小正數讓 q 取到 1 時，權重法自然得到正確的四位小數極限 1/N。

weight 從第一人的 1 開始，每位處理後乘 q。total 累加所有權重，player 等於 chosen 時才保存 target。即使後段權重很小而下溢為零，也只影響遠小於四位小數的量。迴圈結束用 target/total 得答案；真正 p=0 保留初始化的零。fixed 與 setprecision(4) 統一各分支輸出格式。
