Ian's going to California, and he has to pack his things, including his collection of circles. Given a set
of circles, your program must find the smallest rectangular box in which they fit.

All circles must touch the bottom of the box. The figure below shows an acceptable packing for a
set of circles (although this may not be the optimal packing for these particular circles). Note that in
an ideal packing, each circle should touch at least one other circle (but you probably figured that out).

![Rectangle containing four circles of different sizes, all touching the bottom edge and their neighbors](/problem-images/gpe-10606-how-big-is-it.png)

### Input

The first line of input contains a single positive decimal integer n, n ≤ 50. This indicates the number
of lines which follow. The subsequent n lines each contain a series of numbers separated by spaces.
The first number on each of these lines is a positive integer m, m ≤ 8, which indicates how many other
numbers appear on that line. The next m numbers on the line are the radii of the circles which must
be packed in a single box. These numbers need not be integers.

### Output

For each data line of input, excluding the first line of input containing n, your program must output
the size of the smallest rectangle which can pack the circles. Each case should be output on a separate
line by itself, with three places after the decimal point. Do not output leading zeroes unless the number
is less than 1, e.g. 0.543.

### 本站評測規格

保留原題每份輸入最多 50 組、每組 1 至 8 個圓。每個半徑滿足 `0.000001 ≤ r ≤ 10000`，半徑值最多六位小數。輸出的是可容納所有圓的最小矩形寬度（不是面積），固定小數點後三位；浮點運算容許誤差僅用於界定相鄰最近捨入值，不接受任意相差一個末位的結果。
