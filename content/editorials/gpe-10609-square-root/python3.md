bit_length 給出精確二進位長度，位移建立二次冪上界，不需要 log 或 pow 的浮點取整。value//root 和最外層 //2 都是整數除法，root 始終為正，無除零可能。

following>=root 表示從上界下降的過程已到固定點，函式回傳當前 root；否則將 root 換成 following 再做下一輪。主程式以 split 忽略案例空行，讀取宣告筆數，最後使用雙換行連接答案，保留題目要求的組間空白。
