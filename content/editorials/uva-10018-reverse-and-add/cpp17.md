`reversed` 用獨立的區域變數 result，確保每次呼叫從 0 開始。`result*10 + value%10` 將原數字的最低位追加到反轉結果，`value/=10` 則移除該位。

主程式的 do-while 先更新 value 與 additions，再判斷是否回文，因此輸入本身為回文時也會完成第一輪。回文判斷直接比較數值與反轉值，不需要另外保存字串。

value、result 與函式回傳型別都使用 unsigned long long，避免函式內部或相加時發生有號 32 位元溢位。每筆測試重新建立 additions，最後以單一空格分隔次數與結果。
