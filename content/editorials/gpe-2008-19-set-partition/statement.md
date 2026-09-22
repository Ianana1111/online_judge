Given a set $A = \{a_1, a_2, \ldots, a_n\}$ of positive integers, find every subset $A' \subset A$ whose sum equals the sum of its complement:

$$\sum_{a \in A'} a = \sum_{a \in A \setminus A'} a.$$

Count and print all such subsets. The bounds are $1 \le n \le 30$ and $1 \le a_i \le 10^{12}$.

### Input

The input consists of multiple datasets, followed by a line which contains only a single ‘.’ (period). Each dataset is an array of unsigned integers. The array is enclosed by \{\} and any two adjacent unsigned integers of the array are separated with a space.

### Output

For each input dataset, print “No such subset” if the input set contains no subsets which meet the criterion. If the input set can be divided into desired subsets, print the number of such subsets first and then print each of those subsets. Print the subsets sorted with number of elements and values of smallest elements in ascending order (subset with fewer elements printed first, and if number of elements are equal, compare the subsequent successor elements). Each subset is enclosed by \{\} and printed in one line and any two adjacent positive integers in the subset are separated with a space, with elements in increasing order. Each case is separated with a blank line. Follow the format of the sample output.

### LOCAL platform resource limits

The input set contains distinct positive integers. On this platform, each input file contains at most50 datasets and the total number of answer subsets across all datasets is at most10000. The original bounds n<=30 and each value<=10^12 remain unchanged. A subset and its complement are counted separately. This output-size guarantee is an explicit platform restriction, introduced after capacity testing; inputs requiring millions of output lines are outside this local specification.
