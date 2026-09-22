side 每次秤重初始全零，依左、右名單填一與負一。result 用相同的左減右方向編碼，因此 direction 偏輕負一與偏重正一可直接相乘，不需另外列六種條件。

possibilities 在每枚硬幣開始歸零，只代表該枚有幾種輕重假設成立。最後只以 possibilities>0 增加一次 candidates，避免同一枚被算兩次。answer 可先保存候選編號，真正輸出前再要求 candidates==1，零候選與多候選都回傳零。案例間保留題目要求的空白行。
