先用一次 getline 取走 tests 後的換行，之後每組跳過分隔空行，再由 istringstream 解析完整索引行。position 的大小就是 N，不依赖浮點行猜測數量。

數值行也交给 istringstream，但以 string 接收，每次對應一個目的 index。answer[index−1] 將題目的一起始位置轉為 C++ 索引。最後依 answer 順序逐行輸出，tc 只在不同案例之間補一個空白行，不改動數值 token。
