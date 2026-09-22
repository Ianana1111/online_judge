products 以 (deadline,profit) 保存，預設 pair 排序就會按期限先後處理。selected 使用 greater<int>，頂端是目前最小收益；每次加入同步增加 total，真的超期限時再扣掉與彈出頂端。

每輪只需刪一件，因為新商品只讓已可行的集合增加一個元素。輸出的是 total，不是堆大小。while(cin>>n) 只以 EOF 結束，n=0 時排序空容器、堆也為空，正確印零。每組各一行，無論輸入是否跨行。
