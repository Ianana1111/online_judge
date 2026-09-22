cross 實作二維行列式。denominator 由兩條方向向量決定，零時不進入除法分支；平行分支只需檢查另一線的第一個點是否在本線上。非零時 numerator 是參數 t 的分子，再合併 x1、y1 的整數部分，得到完整交點分子。

fixed_ratio 先把負分母同步移到分子，接著對絕對值做精確半向上捨入。只有捨入後非零才保留負號，避免參考輸出出現 -0.00；checker 仍接受數值等價的 -0.00。案例迴圈外只印一次 INTERSECTING LINES OUTPUT 與 END OF OUTPUT，POINT 的兩座標以單一空格分隔。
