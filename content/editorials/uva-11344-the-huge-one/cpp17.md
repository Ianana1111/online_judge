number 保留任意長度十進位文字，divisors 先全部讀入。每個 divisor 都從 remainder=0 開始掃描完整字串，不能沿用前一因數的餘數。digit−'0' 把 ASCII 數字轉為零至九。

wonderful 使用 &= 合併條件，任何一次失敗後都保持 false。輸出直接用 number，避免大數重新格式化，也保留輸入中的數字內容。集合如果為空，所有條件的合取自然保持 true；一般非空集合使用同樣流程。
