solve 使用 best=None 區分尚無合法答案。每個起點都重新把 volume、heat 歸零，再累加完整連續區間；volume 超容量才 break，尚未半滿則 continue，因為後續仍可能合法。

error 是溫差分子的絕對值，不是實際溫差。best_error 與 best_volume 一起保存上一個分數，條件 error*best_volume < best_error*volume 是精確分數比較。嚴格小於保留原本較早的編號；error==0 時才可提早回傳。讀取時先保存整組 jars，因此即使 solve 提早成功，也不會漏讀資料而影響下一組。
