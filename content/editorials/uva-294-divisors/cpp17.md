remaining 保存尚未分解的部分，counts 初始一代表各因數指數選擇數的乘法單位。首個倍數用 (low+p−1)/p*p 向上取整，不會漏掉 low 恰好整除的情況。

prime*prime 的上界比較先轉 long long，區間值也用長整數。每個 p 的整除迴圈完整去掉重複次方，再一次乘 exponent+1。最後先補餘數質因數再比較 counts，best 依升序只在嚴格增加時更新。格式中的區間端點直接沿用原輸入。
