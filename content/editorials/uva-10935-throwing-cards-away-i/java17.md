`ArrayDeque<Integer>` 當作佇列使用：`pollFirst` 從頂端拿走一張，`addLast` 放到底端，兩者都是常數時間。輸入用 `BufferedReader` 逐行讀，再用 `StringTokenizer` 切開，就算同一行有多個數字也能處理；讀到 0 時用帶標籤的 `break outer` 一次跳出兩層迴圈。

輸出先接上 `Discarded cards:`，迴圈中第一張前接空白、之後接 `", "`，由 `first` 控制。每一輪丟一張、再把下一張移到底。

迴圈結束時 `peekFirst()` 就是剩下的牌。所有輸出都累積在 `StringBuilder`，最後一次印出。
