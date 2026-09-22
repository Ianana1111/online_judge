Think the contest score boards are wrong? Here's your chance to come up with the right rankings.

Contestants are ranked first by the number of problems solved (the more the better), then by
increasing amounts of penalty time. If two or more contestants are tied in both problems solved and
penalty time, they are displayed in order of increasing team numbers.

A problem is considered solved by a contestant if any of the submissions for that problem was judged
correct. Penalty time is computed as the number of minutes it took for the first correct submission for
a problem to be received plus 20 minutes for each incorrect submission received prior to the correct
solution. Unsolved problems incur no time penalties.

### Input

The input begins with a single positive integer on a line by itself indicating the number of the cases
following, each of them as described below. This line is followed by a blank line, and there is also a
blank line between two consecutive inputs.

Input consists of a snapshot of the judging queue, containing entries from some or all of contestants
1 through 100 solving problems 1 through 9. Each line of input will consist of three numbers and a
letter in the format

```
contestant problem time L
```

where L can be 'C', 'I', 'R', 'U' or 'E'. These stand for Correct, Incorrect, clarification Request, Unjudged
and Erroneous submission. The last three cases do not affect scoring.

Lines of input are in the order in which submissions were received.

### Output

For each test case, the output must follow the description below. The outputs of two consecutive cases
will be separated by a blank line.

Output will consist of a scoreboard sorted as previously described. Each line of output will contain
a contestant number, the number of problems solved by the contestant and the time penalty accumulated by the contestant. Since not all of contestants 1-100 are actually participating, display only the
contestants that have made a submission.

### LOCAL 排序規則說明

原始 UVa PDF 的罰時方向寫為 decreasing，與一般競賽排序慣例相反。本平台明確採用：解題數由多到少；解題數相同時，罰時由少到多；兩者皆相同時，隊號由小到大。最後一層依本題隊號規則，不採其他賽事的最後 AC 時間規則。
