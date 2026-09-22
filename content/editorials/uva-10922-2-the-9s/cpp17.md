digitSum 遍歷十進位字串，以 ch−'0' 累加數字。主程式以 string 保存 number，只有恰好等於終止標記 "0" 才退出，因此數字中間或結尾的零照常處理。

第一次 digitSum 後即可用 total%9 判斷；否定分支不做 degree 計算。肯定分支初始化 degree=1，再將最多四位的 total 轉回短字串重用同一函式，直到 total=9。最初 number 完全不修改，輸出的超長數字能與輸入一致。
