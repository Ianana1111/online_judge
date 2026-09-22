add 同時新增持久節點與優先佇列項目，queue 項目保存 id 連回 nodes。Item 的 greater 比較器使最低頻率先取，同頻時較早 letter 先取；真實字母索引零到 N−1，dummy 從二十六開始，確保在所有字母之後。

合併過程按取出順序保存 children，因此 child[0] 的邊標零、child[1] 的邊標一。visit 累加根到葉字串，到達葉時只寫回真實字母。最後 weighted 計算每個頻率乘其完整碼長，total 只含原始頻率。每組固定四個行首空格印字母代碼，最後再印一個分隔空白行。
