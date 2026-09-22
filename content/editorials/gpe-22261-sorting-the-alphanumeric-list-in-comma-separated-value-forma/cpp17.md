trim 只尋找非 ASCII 空格的第一與最後位置，內部空格完全保留。Record 同時保存 key、original、index；切欄時使用 substr，不修改 line 本身，所以原始資料永遠可完整輸出。

vector<string> 的標準比較已提供逐欄與短前綴排序，索引只是同鍵的最後穩定條件。讀取以真正空行分組，只有空格的非空行仍保留為資料；每組建立新的 rows，並在非第一組前印空行。最後直接輸出 record.original，連同尾端空格一起保留，讓語意 checker 能驗證原始行的完整多重集合。
