choose[n][k] 先清零，使 k>n 的不可選組合自然為零。每列的 k=0 設一，再由上一列相加，不需要除法或階乘。輸入保證小寫且長度一至五，valid 只需檢查嚴格遞增。

previous 初值 −1 讓第一位候選從 a 的索引零開始。candidate 只到 current−1，計完所有較早分支才把 previous 更新成 current。剩餘可用字母數為 25−candidate，因為 candidate 自身已用掉。
