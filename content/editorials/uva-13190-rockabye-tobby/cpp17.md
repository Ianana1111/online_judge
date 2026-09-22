events 的 greater 比較讓 priority_queue 變成最小堆，pair 第二欄固定原始索引，因此重複插回時優先權不會因插入先後改變。names 與 period 透過同一 id 查詢。

time+period[id] 延續該藥本身的等差時間序列。每次先 pop 舊事件再 push 新事件，堆大小始終維持 N；同時間的其他藥仍在堆中，會依各自索引被正確取出。每個測試組重新建立堆，不殘留前一組事件。
