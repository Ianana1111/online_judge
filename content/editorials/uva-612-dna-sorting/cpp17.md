entries 的 first 是已算好的逆序數，second 是原始 DNA。每條字串讀取後立刻計分，i 從零起、j 從 i+1 起，確保每個不同位置對只檢查一次。

stable_sort 的 lambda 只看 a.first 與 b.first，同分時兩個方向都回傳 false，讓穩定排序保留原輸入順序。tc>0 才先輸出案例分隔空行，不會在第一組前多一行。cin 自動略過題面給的空白行，仍精確讀取每組 n、m 與 m 條字串。
