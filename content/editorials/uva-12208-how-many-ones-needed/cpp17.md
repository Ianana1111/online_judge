prefix 首先處理 n<0，避免 a=0 時出現負除法的特殊規則。bit 表示目前位元的值，period=2*bit 是該位元的完整循環長度；count=n+1 同時用於完整週期商與剩餘長度。

max(0LL,...) 保證剩餘段仍在零區時不扣分，0LL 也保持寬整數型別。bit、period、total 都是 long long，最大輸入附近不會因位移或累加溢位。主程式只在非終止查詢增加 Case 編號，並用 prefix(right)-prefix(left-1) 精確保留兩個端點。
