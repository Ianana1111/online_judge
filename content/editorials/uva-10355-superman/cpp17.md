start、finish 與球心使用 long long，direction 保存飛行向量，a 為非零長度平方。b 的定義不含二，所以判別式使用 b*b−a*c、根使用 (−b±sqrt(D))/a，而不是再多除二。

先略過 D≤0；對 D>0 計算 enter、leave，再用 max(0,enter) 與 min(1,leave) 裁切，若交集為空則由外層 max 歸零。fraction 累計各球的有效區間，percentage=100*fraction 直接輸出兩位小數。每組只印城市名與百分比，不插入題目未要求的空行。
