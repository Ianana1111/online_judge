Slope-based representations need a special case for vertical lines, and floating-point equality is unsafe. Use the integer equation a x + b y + c = 0 instead. For points (x,y) and (u,v), choose a=v−y, b=x−u, and c=−(ax+by).

The same line may produce proportional coefficients. Divide all three by their greatest common divisor, then make the first nonzero coefficient among a and b positive. Each geometric line now has a unique representation. Vertical lines naturally have b=0, while c distinguishes parallel lines at different positions.

`gcd` normalizes the coefficients; a set or sorting removes duplicates. Promote coordinates before subtraction and multiplication, rather than after overflow. C/C++ use the platform compiler's 128-bit integer support; Python uses arbitrary-precision integers and Java uses BigInteger. With P=N(N−1)/2 candidate lines, sorting takes O(P log P) time and O(P) space, excluding integer arithmetic costs.
