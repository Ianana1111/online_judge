Fraction 直接讀取座標文字，保留有限小數的精確值。scale 是所有座標分母的公倍數，因此 numerator*(scale//denominator) 一定是精確整數，limit 也按同一比例放大後平方。全程沒有先轉 float，不會在相等邊界丟失精度。

owner[hole] 記錄洞口目前保護的地鼠，−1 代表空。augment 先標記本次已看過的洞，再嘗試遞迴調整其主人；只有成功才更新 owner。每隻地鼠使用一份新的 seen，成功返回 True 可直接累加成 saved。輸出的是 n-saved，即仍暴露於老鷹的地鼠數。
