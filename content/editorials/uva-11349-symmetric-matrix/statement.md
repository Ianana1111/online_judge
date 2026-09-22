You're given a square matrix M . Elements of this matrix are M<sub>ij</sub> : {0 \< i \< n, 0 \< j \< n}. In this
problem you'll have to find out whether the given matrix is symmetric or not.

Definition: Symmetric matrix is such a matrix that all elements of it are non-negative and symmetric
with relation to the center of this matrix. Any other matrix is considered to be non-symmetric. For
example:

M =

```
5 1 3
2 0 2
3 1 5
```

is symmetric

M =

```
5 1 3
2 0 2
0 1 5
```

is not symmetric, because 3 ≠ 0

All you have to do is to find whether the matrix is symmetric or not. Elements of a matrix given
in the input are −2^32 ≤ M<sub>ij</sub> ≤ 2^32 and 0 \< n ≤ 100.

### Input

First line of input contains number of test cases T ≤ 300. Then T test cases follow each described in
the following way. The first line of each test case contains n – the dimension of square matrix. Then
n lines follow each of then containing row i. Row contains exactly n elements separated by a space
character. j-th number in row i is the element M<sub>ij</sub> of matrix you have to process.

### Output

For each test case output one line 'Test #t: S'. Where t is the test number starting from 1. Line S is
equal to 'Symmetric' if matrix is symmetric and 'Non-symmetric' in any other case.

### 輸入輸出格式補充

依原題範例，每組矩陣尺寸行使用 `N = n` 格式，例如 `N = 3`。輸出完整格式為 `Test #t: Symmetric.` 或 `Test #t: Non-symmetric.`，結尾須有句點。此題的對稱指中心對稱（旋轉 180 度），且所有元素必須非負。
