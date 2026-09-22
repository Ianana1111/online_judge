palindrome 的閉區間索引與 groups 的前綴長度刻意分開：最後一段是 begin 到 end−1。right−left<2 的短路條件處理單字元與兩字元，避免存取反向或越界的中間區間。

groups 初始 n+1 是不可能更優的上界，零長度前綴設零。end 遞增時所有 begin<end 的答案都已完成；只對回文區間更新，因此轉移不需另外檢查段內結構。輸出 groups[n] 即完整字串的段數。
