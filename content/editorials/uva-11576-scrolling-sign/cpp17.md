answer 先設 length，代表載入第一個單字。overlap 每次從完整長度開始，compare 比較 previous 的尾端區間與 next 從零開始的同長度前綴；不相等才遞減。

overlap 降到零時自然代表無重疊，不需要比較空字串。找到最大匹配後，只加入 length−overlap，接著令 previous=next，維持下一輪正確看板狀態。words=1 時內圈不執行，答案就是第一字長度。完全相同的字在第一次比較即成功，因此新增零。
