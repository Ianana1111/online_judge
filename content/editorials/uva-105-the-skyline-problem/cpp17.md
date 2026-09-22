`events` 以座標排序，每個座標存放所有加入或移除事件。這也讓輸入即使有相同左界，不必另外設計複雜的事件排序優先序：先處理整組，再觀察輪廓即可。

`active` 使用 multiset 而非 set，讓同高建築各自存在。結束事件透過 find 找到一個 iterator，再 erase 該 iterator，只刪除一份高度。預放的零不屬於任何事件，因此 rbegin 永遠有效。`previous` 是上一段輸出的高度，只有 current 不同才輸出；first 控制數字之間的單一空格，最後補一個換行。
