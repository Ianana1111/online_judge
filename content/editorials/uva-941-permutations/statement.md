A permutation of a string is the set of all possible ways to combine its characters. E.g., the permutation
of "abc" is \{"abc", "acb", "bac", "bca", "cab", "cba"\}. The size of this set is the factorial of the
initial string size.

Given a string S (with up to 20 characters, all lowercase letters) and a integer N (0 ≤ N \< 20!)
find the (N + 1)-th smallest element of the permutation of S (consider the lexicographic order; the
permutation of 'abc' above, for example, is represented in lexicographic order form left to right).

- E.g., if S = "abc" and N = 0, then the result would be "abc"
- E.g., if S = "abc" and N = 5, then the result would be "cba"
- E.g., if S = "abc" and N = 3, then the result would be "bca"
- E.g., if S = "cba" and N = 3, then the result would be "bca"

Notice that the string may not be initially sorted (check the last two examples).

### Input

The input file contains one line with the number of samples and then each sample consists of two lines:
one with string S and the next with number N .

### Output

For each sample, a line with the required value.

### LOCAL platform clarification

Count distinct resulting strings, including when S contains repeated letters. The number of permutations is len(S)! divided by the product of each letter-frequency factorial; the factorial-only sentence applies to distinct letters. The supplied zero-based N is less than this actual number.
