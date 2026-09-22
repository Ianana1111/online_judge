fact 與 inv 都一次預處理到完整 N 上限，choose 先乘一次就取模。n<k*x 的情況不進入任何計算，answers 中對應值保持零；唯一盒子合法時直接是一種。X=1 分支按空盒集合做容斥，負項先加 MOD 再取餘數。

一般分支將案例依 (k,x) 分組，n 取同組最大彈珠數；每個 query 保留原編號與所需 sizes[query]。同組只建立一次完整末列，再各自取回答案，輸出順序與分組順序無關。

binomial[balls] 是 C(balls−1,x−1)，與盒子數無關，因此只算一次。previous 保存 f(·,boxes−1)，current 保存正在建立的 f(·,boxes)。由小到大更新 balls，使 current[balls−1] 已算好；previous[balls−x] 則仍是上一列。每列先清零，避免留下上次交換的內容。最後交換兩列，處理完 k 盒時 previous[sizes[query]] 就是該查詢答案。
