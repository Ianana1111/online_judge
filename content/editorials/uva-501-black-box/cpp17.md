inserted 記錄已加入 A 的前綴長度，while 只補到當前 queries[rank]。lower 大小在每次 GET 前等於過去查詢次數，插入時若交換一出一入，大小不變。

upper 使用 greater<long long> 讓最小值在頂端，lower 使用預設最大堆。GET 的一推一彈將分界向後移一名，再印 lower.top。堆會保留相同數值的多份元素，完全符合排序位置定義。案例間在 tc>0 時先印空白行，每個答案獨立一行。
