Please find the longest monotonically increasing subsequence (LMIS) of a sequence of n numbers (each number m, 1≤ m ≤ 2^32-1)and indicate its length of the sequence. For example, the sequence

    2, 5, 3, 1, 6, 4

has three LMISs of length 3, namely,

   (2, 5, 6),  (2, 3, 6),  (2, 3, 4).

### Input

First line in the input file indicates the number of input patterns. The first of  the following two lines denotes the number of sequence elements n (1≤ n ≤ 9)and next denotes the sequence representing the individual test pattern. Every two numbers are separated by a space.

### Output

In each output, you must point out the number of LMIS in the test pattern, and then output the possible LMIS below. Every two numbers are separated by a space. Please follow the format of the sample output.

The first output number is the number of longest increasing subsequences, not their length. List all of them, one subsequence per line; the order of these lines does not affect the verdict.


### LOCAL 子序列計數說明

子序列以所選取的原始索引位置區分。同一數值可以出現在不同位置；不同索引選擇即使形成相同數值序列，仍分別計入條數，並各輸出一行。遞增必須嚴格，不能把相同值連在同一遞增路徑中。所有輸出行的先後順序不限，但各行的重複次數必須完整。
