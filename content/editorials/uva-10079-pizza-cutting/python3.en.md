Think about adding one cut: the kth line intersects at most k−1 older lines, giving at most k segments and k new pieces. Starting from one piece with zero cuts, summing 1 through N yields `1 + N(N+1)/2`. The program evaluates this formula directly, including N=0. A negative value ends input and has no output. The intermediate product can exceed 32 bits, so the arithmetic must use a sufficiently wide integer type.

The Python version splits whitespace-separated input and advances by each group’s actual field count.
