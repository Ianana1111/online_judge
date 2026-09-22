vertices 記錄真正出現的節點，indegree 每讀一條邊就加一，即使是重複邊也不去重。0 0 先觸發完整檢查與輸出，再清空本組資料；負數終止對不另外產生一組空案例。

roots 保存所有入度零節點。只有非空且已有唯一根、其餘入度皆一時才需要 BFS。visited.insert(y).second 表示第一次發現 y，避免有問題的圖讓搜尋重複循環。最後用 visited.size 與 vertices.size 比較，抓出不連通的環。Root is 只在合法非空樹輸出；空樹分支保留原有平台格式。
