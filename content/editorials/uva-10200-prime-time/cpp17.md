前段 sieve 只產生試除用的質數，不是直接篩所有多項式值。prefix 長度多一格，prefix[0]=0，使 a=0 也能使用同一個差分公式。試除迴圈先比較 divisor² 與 value，相等時仍必須檢查整除。

fixed_ratio 接收尚未轉成浮點數的分子分母，先把精度尺度算成 10^digits。公式 (2·numerator·scale+denominator)/(2·denominator) 對非負有理數做半向上捨入。再拆整數與小數部分並補零，因此百分之百印成 100.00，零印成 0.00。查詢中先把 count 乘一百才交給函式，表示傳入的是百分比。
