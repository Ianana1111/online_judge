remaining 是試除時持續縮小的暫存值，value 保留原狀態，用於判斷最後剩餘因數是否等於原數。每個 p 記錄後以 while 除盡，因為相同質因數的重數不會形成不同的下一個狀態。

distance 長度取 max(start,target)+1，因此 S>T 時仍能安全設定起點；所有 next 超過 target 都略過，最後自然留下 target 的 −1。起點先設零，S=T 不需特判也會輸出零。案例序號逐筆增加，終止雙零不列入。
