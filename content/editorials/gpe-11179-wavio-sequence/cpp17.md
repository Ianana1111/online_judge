ending 回傳每一個位置自己的遞增長度，並非只有 tails 的最後大小。it 可能因 push_back 失效，所以先計算 position 再修改向量，最後保存 position+1。

第二次 ending 的索引對應反轉後的位置，必須 reverse(right) 才能與 left[i] 指向同一峰頂。主迴圈用 min 保證兩側等長，乘二後減一避免峰頂算兩次。N 至少一，answer 初始一涵蓋完全遞增、遞減與全部相等的序列。
