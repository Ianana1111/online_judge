coefficient 的索引 i 對應 degree=8−i，因此輸入和輸出順序一致。只有確定 c 非零後才處理符號與 first，開頭的零不會干擾首項判斷。

magnitude 將負號和數值分離，避免雙重印出負號。係數顯示條件以 degree==0 優先涵蓋常數；變數和次方則分兩層判斷。first 只在真正輸出一項後變 false，迴圈結束仍為 true 就代表全部九項為零。
