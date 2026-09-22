Assume that you have two urns before you. Initially, one urn has one ball and the other urn has two
balls and exactly one ball in each urn is red. At this initial stage you are asked to pick up two balls,
one from each urn. Then one white ball is added in each urn and you are again asked to pick up one
ball from each urn then again one white ball is added in each urn. This process continues for a certain
time. Remember that you place the picked ball back to the urn after each pick up. You will have to
determine the probability that in any of your pickups both of the picked balls were red and also the
probability that all of your picked balls were red after certain steps.

### Input

The input file contains several lines of inputs. Each line of the input file contains an unsigned integer N
(N \< 1000000) indicating how many times you will pick up. Of course after each pick up an increment
in balls occurs as described previously.

### Output

For each line of input print a single line of output containing a floating point number and an integer.
The floating-point number indicates the probability that you have picked up two red balls in at least
one of your pick-ups and the second integer denotes how many consecutive zeros are there after decimal
point in the probability value that all of your pick ups has both balls as red.

### 本站評測規格

- 每份輸入最多 1,000 筆查詢，保留原題的 `0 ≤ N < 1,000,000` 範圍。
- 第一個機率固定輸出小數點後六位；第二個數為整數，兩者以一個空格隔開。
- `N=0` 表示沒有抽取；至少一次兩顆皆紅的機率為 0，全部零次皆紅的空事件機率為 1，前導零數定義為 0。因此輸出 `0.000000 0`。
