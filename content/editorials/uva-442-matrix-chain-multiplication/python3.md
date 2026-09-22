stack 只儲存已完成子式的尺寸，不需要儲存矩陣內容。右括號先 pop 右側的 other_rows、cols，再 pop 左側的 rows、shared；比較 shared 與 other_rows 才是矩陣乘法的相容條件。

total 在每次合併時加入本次成本，所有內層先前已加過，因此無需再從堆疊取出子成本。即使已不相容，仍照文法消耗整個式子並保持 valid=False，最後不輸出無意義成本。每個新運算式重新清空 stack、total 與 valid；跳過空行只是讀取上的容錯，不把空式列成合法案例。
