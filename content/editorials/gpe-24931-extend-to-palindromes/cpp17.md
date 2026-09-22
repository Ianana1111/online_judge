reversed 先複製 s 再原地反轉，joined 中唯一 # 將兩段隔開。prefix[i] 表示截至 i 的最長真前綴／後綴匹配長度；失配時沿 prefix[length−1] 回退，不會重新掃描全部字元。

prefix.back() 給出需要保留的回文後綴長度。substr 只取前面尚未配對的部分，將它反轉成 extra 接上。當 suffix==s.size() 時 extra 是空字串，程式自然輸出原回文，不需額外分支。
