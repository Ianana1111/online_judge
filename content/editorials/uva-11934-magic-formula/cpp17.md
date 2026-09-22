while 先完整讀五個值，再以邏輯或確認不是五零，避免在終止資料上對 divisor=0 取模。正常 divisor 保證大於一，即使所有係數和 limit 都是零也仍可處理。

x 和係數都是 long long，Horner 運算以兩次乘法得到精確整數。value%divisor 的結果可能為負，但和零比較完全符合整除定義。answer 每組從零開始，使用包含等號的上界，讓 limit=0 時仍恰好執行一次。
