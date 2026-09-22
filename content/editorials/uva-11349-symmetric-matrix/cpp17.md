讀取標頭時，`label` 接收 N，`equals` 接收等號，再讀出 n；字元讀取會略過空白，所以能處理 `N = 3` 的格式。

`vector<long long>` 按輸入順序保存 n² 個值。讀取迴圈只把 symmetric 改成 false，不會提前中斷，因此後面的資料仍能正確對齊。long long 足以保存正負 2³²。

第二個迴圈以 `values.size()-1-i` 取得反向索引，完成中心對稱檢查。即使 i 是中央元素，也只是和自己比較，不需特判。最後根據布林值選擇完整的 `Symmetric.` 或 `Non-symmetric.` 字串，每組編號從 1 開始。
