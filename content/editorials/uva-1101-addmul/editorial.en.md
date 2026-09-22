# Convert programs into affine maps and optimize their base-m digits

## Problem and constraints

Instruction `A` adds a and `M` multiplies by m. Find one program mapping every integer `x` in `[p,q]` into `[r,s]`. Minimize instruction count, then lexicographically minimize the expanded instruction string with `A<M`. Parameters are positive and at most one billion. Output run lengths such as `3A 2M`; print `empty` or `impossible` when appropriate.

## Building the approach

Fix the number k of multiplication instructions. Group additions by how many multiplications follow them. If `d_i` additions have i multiplications after them, the final value is

`x*m^k + a*B`, where `B=sum d_i*m^i`.

The map is increasing, so checking interval endpoints is sufficient. Feasible B values satisfy

`L=max(0, ceil((r-p*m^k)/a)) <= B <= floor((s-q*m^k)/a)=U`.

Only k with `q*m^k<=s` are possible. When `m=1`, multiplications do nothing and k=0 suffices.

For positions below k, any digit `d_i>=m` can carry m additions into one higher-position addition, preserving B while reducing instruction count. Thus a shortest program uses standard base-m digits in its low k places, while the top digit may be unbounded. Addition count is the digit sum.

We need not scan every B. For `j=0..k`, test `ceil(L/m^j)*m^j` if it lies in `[L,U]`: these are L or the values obtained by carrying upward and zeroing a low suffix. Every minimum digit-sum value in the interval appears among them. Convert each candidate into alternating A-runs and M instructions, compare total expanded length, then compare compressed runs as if expanded.

## Walkthrough

Let `a=1,m=2`, input interval `[2,3]`, and target `[10,20]`. With k=2, feasible B is `[2,8]`. B=2 gives `MAM`, mapping to `[10,14]`; B=4 gives `AMM`, mapping to `[12,16]`. Both have length three, but `AMM` is lexicographically smaller, so output is `1A 2M`.

## Why it works

Every program with k multiplications has exactly the stated affine form, because an addition followed by i multiplications contributes `a*m^i`. Conversely, its digit counts reconstruct such a program. Monotonicity proves endpoint feasibility is equivalent to full-interval feasibility.

Carrying any low digit at least m strictly reduces additions, so all shortest representations have canonical low digits. For any feasible B above L, inspect the highest digit where it differs from L; lowering that prefix to the smallest greater one and clearing lower digits yields one of the rounded candidates no larger than B and with no greater digit sum. Therefore some length-optimal, and then lexicographically optimal, value is enumerated. Comparing all candidates for every feasible k gives the global optimum.

## Complexity

Let `K=floor(log_m(s/q))` for `m>=2`; `K<=29`. There are `O(K^2)` candidates and each uses `O(K)` construction/comparison work, for `O(K^3)` time and `O(K)` space. Run-length storage never expands huge A counts.

## Common mistakes

- Checking only one input endpoint.
- BFS-searching values up to one billion or materializing enormous strings.
- Trying only B=L and missing a carry that reduces additions.
- Comparing printed run-count text rather than expanded instruction lexicographic order.
- Enumerating useless multiplications forever when `m=1`.
