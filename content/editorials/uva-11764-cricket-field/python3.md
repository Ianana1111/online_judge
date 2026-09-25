題目只關心每次相鄰移動的方向，因此不需要保存整個高度序列。從第一座牆開始記住 previous，之後每讀一座就比較 current 與 previous，分別增加上升或下降次數，再把 current 變成下一輪的 previous。

讀第一個高度存為 previous，從第二座牆開始逐一讀 current。若 current>previous 就增加 high；若 current<previous 就增加 low；相等則跳過計數。每次比較後都把 previous 更新成 current，下一次才能比較相鄰兩座牆。

總共只會發生 N−1 次跳躍。初始站上第一座牆不算一次高跳，也不需要設想從地面高度零開始。題目問的是次數，和每次高低差有多少無關。

高低相同不計入任何一邊；每讀完一座都更新 `previous`。
