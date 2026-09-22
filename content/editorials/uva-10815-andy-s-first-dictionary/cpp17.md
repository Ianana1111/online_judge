flush 將目前非空 word 插入 dictionary，之後清空，不論遇到什麼分隔符都可共用。cin.get 會讀入空格和換行，因此不會跳過影響分詞的邊界。

大小寫轉換只處理 ASCII A–Z，再檢查 a–z 是否為合法字母，避免 locale 或 signed char 對字元分類造成差異。EOF 後額外呼叫 flush，保存尚未遇到分隔符的最後一個單字。最後遍歷 set，已經同時符合去重、小寫與遞增字典順序，不需要再排序。
