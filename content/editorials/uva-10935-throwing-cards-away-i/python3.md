`collections.deque` 的 `popleft` 和 `append` 都是 O(1)，正好對應「從頂端拿走」和「放到底端」。如果改用一般 list 的 `pop(0)`，每次都要把後面的元素往前搬，n 到一萬時會明顯變慢。

每一輪先 `popleft()` 一張，加入 `thrown` 串列；再 `popleft()` 一張並 `append` 回尾端。剩一張時迴圈停止。

輸出時用 `", ".join(map(str, thrown))` 組出逗號加空白的分隔；只有 `thrown` 不是空的才在冒號後加一個空白，所以 n = 1 時第一行就是 `Discarded cards:`，沒有多餘空白。所有行收集起來最後一次寫出。
