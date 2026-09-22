events 保存原始 start、finish，lambda 只按 second，也就是结束時間比較。start<finish 的保證讓每次接受後 end 嚴格向後，不會在同一時間重複接受同一區間。

while 的兩數同為零時停止讀取目前案例，不會把終止符加入容器。掃描時只在 start>=end 更新答案與終點，被跳過的活動完全不改狀態。end=0 包含最早可用時刻，空 events 時迴圈不執行，answer=0 正確輸出。
