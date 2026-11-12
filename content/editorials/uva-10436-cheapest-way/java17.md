輸入用 `BufferedReader` 搭配 `StringTokenizer`，`next()` 在目前這行用完時自動讀下一行，空行也會被跳過。站名用 `HashMap<String,Integer>` 對應編號，道路存在 `long[][] road`，以 `Long.MAX_VALUE / 4` 當作無限大，相加時不會溢位。

每個查詢做 O(n²) Dijkstra：起點成本是它的過站費，每輪選出成本最小的未完成站 x，用 `cost[x] + 2 * road[x][y] + fee[y]` 更新，並記錄 `prev`。

路線從終點沿 `prev` 往回走，每次把站名插到 `StringBuilder` 的最前面，終點本身後面不加空白，所以組出來的字串順序正確、行尾也沒有空白。票價用整數算出四捨五入後的分，再分別輸出整數部分、十分位與百分位。地圖之間的空行只在 m > 1 時加入。
