sort 依 pair 的左端、再右端排序。內層 while 消耗所有目前能銜接的區間，以 chosen 記錄最遠候選的原始 pair 索引；farthest 從 covered 開始，所以只有真正向前才會選中。

找不到候選時清空答案，輸出零代表整個問題無解。成功後將原 pair 原封不動加入，covered 更新到 farthest。外層 test 控制組間空白行，cin 自動忽略題目中的空行；終止 pair 由 a||b 過濾，不會被當成可選區間。
