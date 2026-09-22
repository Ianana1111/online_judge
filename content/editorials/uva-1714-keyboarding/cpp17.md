next 保存每格四方向中有效的跳躍目的地，同一格內的一串相同字元以 while 跳過，停在第一個不同者。cost 初始只有左上格為零，其他為不可達；每輪把全部可達落點以各自成本放入最小堆，過時的堆元素直接略過。

direction 邊成本固定一，Dijkstra 結束後，cost 只接收 grid 字元等於本輪 target 的 distance。word 先接上 Enter，targets 只刪除連續重複字元；selections 在壓縮之前依原文長度加一計算，因此所有真實選取都算到。最後從 Enter 的可能落點中取最小方向成本，再加 selections。
