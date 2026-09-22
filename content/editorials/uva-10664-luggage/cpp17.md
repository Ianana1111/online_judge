讀完 tests 後先 getline 接走該行尾端，接下來每次 getline 才是完整行李案例。istringstream 將該行所有整數讀完，同時保存重量與總重，不會跨行讀進下一組。

只有總重偶數才建立 DP。reachable[0]=true 表示不拿行李可以湊零；每件從 target 下降到 w，避免本輪反覆利用自己。最後 reachable[target] 決定结果，不需要還原實際分車名單，也不需要要求兩車件數相同。
