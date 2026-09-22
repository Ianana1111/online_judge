lower 使用 priority_queue 的預設最大堆；upper 以 greater<long long> 改成最小堆。新值先與 lower.top 比較，lower 為空時直接加入，避免存取空堆。

平衡分支讓 lower 不會比 upper 多兩個以上，也不會比 upper 少。每次只新增一個數，移動一次堆頂就足以恢復數量條件。移動時先 push 到另一側，再 pop 原堆。

兩堆等大時，程式以 long long 完成堆頂相加後才除以 2。所有輸入非負，因此 C++ 整數除法正好符合捨去小數部分的規則；lower 多一個時直接輸出它的頂端。迴圈依 EOF 停止，不另外判斷 value 是否為 0。
