period 用 lcm 累計所有循環長度，每個 phase 的排序鍵取 milk[cow][phase%週期長度]。同奶量按索引排序只讓資料穩定，真正判斷仍比較產奶量，因此不會把較小索引誤當唯一勝者。

first 與 second 都是各相位獨立的單調指標，second 至少保持 first+1，並各自跳過已死亡牛。day 從零開始表示相位，取得當天候選後先加一，再把 last 記成一日起算日期。成功吃牛將 idle 歸零，未吃才增加；remaining 歸零或完整 period 無變化時停止，輸出 remaining 與 last。
