position 以字母減 A 作索引，直接取得全域中序位置。build 的 left、right 只限制目前子樹區間，next 則跨呼叫維持前序進度；讀 root 後立即遞增，下一呼叫便讀該子樹的下一個根。

左區間不含 middle，右區間從 middle+1 開始，因此根不會進入任一子樹。answer+=root 放在兩個遞迴之後，精確對應後序的最後一步。每筆輸入重新建立 position、next、answer，避免案例間留下遍歷狀態。
