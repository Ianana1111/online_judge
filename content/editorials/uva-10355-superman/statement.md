Superman, with his incredible power, can fly faster than rockets! He can even pierce the Great Wall
if it is in his path, and this doesn’t affect his speed. But he is facing an unbearable problem in large
cities now a days. Some regions of these cities are covered with polluted air. When flying through these
regions, he can hardly breathe and his speed reduces significantly. He wants to find out whether he
could pass through such regions by finding out the length of his path through these regions.
Superman knows that each regions of polluted air have the shape of a sphere. He also knows where
the polluted regions are located. But he doesn’t know how to calculate the path length inside a sphere.
So, he requests you to do that for him.

### Input

There are multiple datasets. Input is terminated by EOF. Each dataset consists of the followings (All
numbers are integers \< 21 in absolute value):

- City name (consisting of 1 to 8 alphanumeric characters) in the first line.
- Starting and ending points’ coordinates (x<sub>1</sub>, y<sub>1</sub>, z<sub>1</sub>, x<sub>2</sub>, y<sub>2</sub>, z<sub>2</sub>) of Superman’s path (separated by
space(s)). He always flies in a straight line.
- Number (between 1 and 10 inclusive) of polluted regions in the third line.
- Center and radius (x, y, z, r) of each region (separated by space(s)), one line per region. No two
regions intersect each other.

### Output

For each dataset, print the city name in a line followed by the percentage of his path inside polluted
regions. The result should be correct to 2 places after the decimal point.

### 本站評測規格

起點與終點不同；半徑為 1 至 20 的整數，座標保留原題絕對值小於 21。污染球的內部互不重疊，外部相切允許；切點沒有路徑長度。百分比取最近的兩位小數，若精確位於兩個輸出值的正中央，兩者皆可接受。
