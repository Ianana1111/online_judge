power 初始為一，lower 在每輪先累加目前 power，再把 power 乘 prime，因此迴圈結束時 lower 包含零到 a−1 次方，power 正好是 a 次方。兩者一直取模，無需保存數百位整數。

factor 加上 (exponent+1)*power，精確表示 p 已取最大指數時 q 的全部選擇。ordered 累乘每一種質數的加權因子，number 同步累乘最大冪，分別代表 A 與 n。最後相加取模並以 Case 編號輸出，沒有浮點運算，也沒有把模值當成可直接整除的真實整數。
