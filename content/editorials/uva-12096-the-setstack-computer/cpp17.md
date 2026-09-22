intern 先在 map 尋找相同 set，找到就回傳舊 ID；只有全新內容才追加到 values。所有 set 元素是先前已建立的 ID，沒有自我參照的循環集合。

a 是先彈出的頂端，b 是第二個。ADD 先複製 values[b] 再插入 a，從未改動既有 values。UNION、INTERSECT 使用有序集合演算法和 inserter 產生新集合。所有讀取與結果計算完成後才 intern，避免 values 追加時造成正在使用的參考失效。每個案例重新建立登錄表與堆疊，T=0 時完全不輸出。
