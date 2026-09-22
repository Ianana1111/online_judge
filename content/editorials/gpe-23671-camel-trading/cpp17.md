evaluate 的 first 指定先計算加法或乘法。group 保存尚未結算的一段；遇相同運算子就繼續吸收下一個數字，遇另一個運算子才把它併入 answer。求最大時 answer 的合併是乘法，初值一；求最小時合併為加法，初值零。

迴圈結束後仍有最後一段，所以回傳前再做一次合併。stringstream 能完整讀入一或兩位數並略過合理空白。values 長度永遠比 operators 多一，operators[i] 連接 values[i] 與 values[i+1]。
