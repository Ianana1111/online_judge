每讀一個 word 都重新建立零化的 counts、空集合與旗標，字與字之間互不影響。counts 的索引由 ch−'a' 決定，符合全小寫輸入。

set::insert 的 second 表示是否真的插入新元素；若為 false，該頻率已經被另一種字母用過。unique 一旦失敗就不再恢復。distinct 只對正頻率加一，因此最後可以獨立判斷種類門檻。外圈以 EOF 讀每組 n，tc 每組加一，answer 每組歸零。
