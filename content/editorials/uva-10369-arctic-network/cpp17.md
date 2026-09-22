DSU 的 join 只在兩端分屬不同群時回傳 true，chosen 因此只記成功合併數。edges 的第一欄是平方距離，tuple 排序同距離時再依端點固定順序，但不影響最小閾值。

answer 在每次成功合併後更新，當 chosen 到 n−satellites 便停止；因題目保證 satellites<n，至少會選入一條邊。sqrtl 只在最後輸出時呼叫一次，保留較高精度並由 fixed、setprecision(2) 產生兩位小數。重複座標若出現，零距離仍是合法可用的邊。
