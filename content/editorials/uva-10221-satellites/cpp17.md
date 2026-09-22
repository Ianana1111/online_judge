degrees 先存為 long double，角分除 60.0L 不會截斷小數。fmodl 正規化完整圈，接著以三百六十度補角限制到零至一百八十。radius 和 theta 都保持 long double，避免先用精度較低的常數計算。

arc 與 chord 分別套用弧長與半角正弦公式。輸出兩欄的固定六位小數；高度零仍代表地表圓而不是半徑零，夾角零也不作為輸入終止。
