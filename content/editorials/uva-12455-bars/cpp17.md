possible 陣列只到 target，因為正長度加入後不可能從超過目標再回來。每根先讀入較寬整數，超過 target 時 continue 只跳過轉移，不跳過資料讀取。

倒序迴圈的 sum 使用有號整數，降到範圍外能正常停止。possible[sum] 的舊值保留不選的選項，來源 possible[sum−length] 則提供選取的可能。所有棒子讀完才輸出，外層 tests=0 時完全不輸出，符合輸入允許的零案例情況。
