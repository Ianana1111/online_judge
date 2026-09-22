path push 後遞迴，回來一定 pop，讓下一候選共享正確前綴。最後收錄 rest 也用一次 push/pop，answers 得到獨立複本，不會隨回溯被修改。

minimum 從二開始，遞迴傳入當前 divisor，允許相同因數重複，例如 2 2 5，同時禁止較小者出現在後面。path 非空是排除單獨原數的關鍵。std::sort 對 vector<int> 採逐項數值字典序比較，避免將答案先轉文字造成排序規則錯誤。
