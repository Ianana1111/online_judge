getline 先消耗行程數後的換行，再整行讀取每個行程；istringstream 只取前兩個時間欄，其餘說明自然忽略，不會污染下一行。minutes 將固定 hh:mm 格式轉成整數。

加入 18:00 邊界後按 pair 排序，cursor 從 10:00 開始。重疊時 start−cursor 可為負，嚴格比較不會更新最佳空檔。輸出時間兩部分各用 setw(2)，時長本身不補零，且六十分鐘也走 hours 分支。
