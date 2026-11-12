輸入用 `DataInputStream` 加 64 KB 緩衝自行解析：`nextNonSpace` 跳過空白、換行與 `\r` 後回傳下一個字元，`nextInt` 用它讀整數。讀字串時不斷取下一個非空白字元，直到 `#` 或檔案結尾，只計數前 n 個字母。

`ranked` 先用 `Arrays.sort` 由小到大排，再原地反轉成由大到小。`take(a, b)` 從 A 往後找第一個未使用、數量是 a 或 b 的工人，代表目前可用的最小字母。

左半邊每層挑字母並在 `rightNeed[k]` 記下另一個數量，N 為奇數時中間放最小數量，右半邊由內往外填 `order[n-1-k]`。兩行都寫進 `StringBuilder`，全部處理完再一次輸出。
