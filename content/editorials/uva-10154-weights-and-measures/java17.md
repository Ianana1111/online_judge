輸入用 `BufferedReader` 逐行讀，`StringTokenizer` 會處理「一個或多個空白」分隔的情況，所有數字先收進 `ArrayList<Long>`，再兩兩組成 `{力量, 重量}` 的陣列。

排序時以力量為主、重量為次，使用 `Long.compare` 避免相減溢位。`PriorityQueue` 搭配 `Collections.reverseOrder()` 就成為最大堆，`poll()` 會取出目前最重的重量。

主迴圈依力量由小到大加入烏龜並累加 `total`（`long` 型別），一旦總重超過這隻的力量，就把 `poll()` 拿到的最大重量減掉。最後 `stack.size()` 即為答案。
