dreams 是由外而內的路徑，push_back、pop_back、back 三種尾端操作直接對應題目指令。Sleep 才讀取下一個姓名，因此不會把後面的指令當成 Kick 或 Test 的參數。

Kick 與 Test 都先檢查 empty，避免空容器操作。Test 的條件運算子只會求值被選中的分支，所以空堆疊時不會呼叫 back。姓名以原字串儲存並輸出，大小寫和重複姓名都完整保留。queries 控制恰好讀指定數量的指令，沒有額外終止字。
