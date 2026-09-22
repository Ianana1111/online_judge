Dinic.add 同時保存初始容量和殘量，反向邊初始容量零。send 找到可推流路徑後，同步減正向容量、增反向容量；maximum 的 BFS 與 current-arc next 指標加速後續增廣。

主程式 edge[i][j] 保存對應隊伍→桌子的前向 adjacency 索引，最大流結束後以 initial−capacity 取出實際入座人數。這些邊原容量一，因此每桌對每隊只會印零次或一次。只有總流量等於 required 才進入輸出名單，否則立刻印零。桌號加一還原題目的編號，隊伍則始終按輸入順序輸出。
