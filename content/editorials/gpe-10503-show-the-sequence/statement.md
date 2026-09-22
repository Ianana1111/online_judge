The problem of finding the next term of a given sequence of numbers is usually proposed in QI tests.
We want to generate the N terms of a sequence from a given codification of the sequence.

Let S = (S<sub>i</sub>) for i ∈ IN denote a sequence of real numbers whose i-order term is S<sub>i</sub>. We codify a constant
sequence with the following operator:

<div class="oj-center">S = [n] meaning that S<sub>i</sub> = n for all i ∈ IN</div>

where n ∈ ZZ. We also define the following operators on a given sequence of numbers S = (S<sub>i</sub>) for i ∈ IN:

<div class="oj-center">V = [m + S] meaning that V<sub>i</sub> = m, if i = 1; V<sub>i</sub> = V<sub>i-1</sub> + S<sub>i-1</sub>, if i > 1</div>

<div class="oj-center">V = [m * S] meaning that V<sub>i</sub> = m * S<sub>1</sub>, if i = 1; V<sub>i</sub> = V<sub>i-1</sub> * S<sub>i</sub>, if i > 1</div>

where m ∈ IN. For example we have the following codifications:

<div class="oj-center">[2 + [1]] = 2, 3, 4, 5, 6 ...</div>
<div class="oj-center">[1 + [2 + [1]]] = 1, 3, 6, 10, 15, 21, 28, 36 ...</div>
<div class="oj-center">[2 * [1 + [2 + [1]]]] = 2, 6, 36, 360, 5400, 113400 ...</div>
<div class="oj-center">[2 * [5 + [-2]]] = 10, 30, 30, -30, 90, -450, 3150 ...</div>

Given a codification, the problem is to write the first N terms of the sequence.

### Input

The input file contains several test cases. For each of them, the program input is a single line containing
the codification, without any space, followed by an integer N (2 ≤ N ≤ 50).

### Output

For each test case, the program output is a single line containing the list of first N terms of the sequence.

| Input | Output |
|---|---|
| `[1+[2+[1]]] 5` | `1 3 6 10 15` |
| `[2*[1+[2+[1]]]] 6` | `2 6 36 360 5400 113400` |

### LOCAL platform resource limits

This platform allows at most20 datasets per input file, codification length at most200 characters and bracket nesting depth at most20. Each integer literal has absolute value at most10^9; coefficients m before an operator are positive integers. For every nested subexpression, every one of its first N terms has absolute value less than10^1000 (at most1000 decimal digits; the minus sign is excluded). N remains between2 and50. These are explicit local resource bounds, including intermediate sequences, introduced after capacity testing.
