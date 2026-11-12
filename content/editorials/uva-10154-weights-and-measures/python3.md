整份輸入讀成一串整數，`values[0::2]` 是重量、`values[1::2]` 是力量，用 `zip(values[1::2], values[0::2])` 組成 `(力量, 重量)` 再排序，就是依力量由小到大。

Python 的 `heapq` 只有最小堆，所以存入重量的負值，堆頂的負值最小，也就是原本最重的那隻。每隻烏龜加入時 `heappush(stack, -weight)` 並把 `total` 加上重量；若總重超過力量，`heappop` 取出的是最大重量的負值，直接 `total += heappop(stack)` 就等於減去那個重量。

最後 `len(stack)` 就是能疊的最多隻數。Python 整數沒有溢位問題。
