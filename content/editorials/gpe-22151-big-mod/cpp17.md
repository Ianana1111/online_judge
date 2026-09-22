讀入型別統一為 long long，base 先 %=modulus，之後每次 result 與 base 都保持在零至 M−1。result=1%modulus 同時處理零指數與模數一，無需額外特判。

位元測試 exponent&1 決定是否乘入當前冪。平方與右移必須每輪都執行，不可只放在奇數分支內。cin 連續讀三個數，自然接受分行與空行；每個案例只印一個餘數。
