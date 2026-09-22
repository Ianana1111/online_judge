primeCount、primeSum 保存不超過索引的質數個數與總和；twinCount、twinSum 的索引代表孿生質數中較大者，也就是三格形狀的跨度。使用 n−1 查表，正好只保留能放進 N 格內的正距離。

chooseSmall 只需 r=0、1、2、3，先模乘連續 r 個因子，再乘 r! 的模反元素；n<r 時立即回零。supports 將四種非空格數分開，便於核對推導。每項先將位置數模 MOD，再乘已取模的分配數，最後累加取模，所有中間乘积皆在 long long 範圍內。
