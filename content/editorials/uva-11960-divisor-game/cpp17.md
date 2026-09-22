讀取 queries 的同時更新 limit，之後兩個陣列只配置到需要的最大值。外層 divisor 走過所有正整數，內層 multiple 從它自己起跳，每加一次就代表找到該 multiple 的一個不同正因數。

record 初始化一，前綴迴圈也從一開始，所以最小範圍自然正確。divisors[n]>=divisors[record] 的等號不可刪除：n 是目前最大見過的值，同分正應替換較小的 record。best 陣列保存每個前綴的結果，最後按原查詢順序輸出，不因預處理而改變案例順序。
