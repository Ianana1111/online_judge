`readLines(n)` 一定呼叫 n 次 getline，空字串不會讓行數少算。每行末尾的 CR 只作為 Windows 換行的一部分移除，行尾真正的空格會留下。主迴圈讀完 n 或 m 後先 ignore 到換行，避免把讀數字後剩下的換行誤當成第一行內文。

`standard == team` 使用 vector 與 string 的完整相等比較，同時檢查行數與每行內容。`visible` 以原順序收集非空白字元，`unsigned char` 避免把負的 char 傳給字元分類函式。`characters` 直接累加 standard 的各行長度，所以空格被計入、換行不被計入。最後先遞增 run，再依 CPE 格式一次輸出判決和標準字元數。
