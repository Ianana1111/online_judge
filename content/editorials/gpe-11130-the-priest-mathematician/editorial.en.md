# Optimize the stated split strategy with a safe cost bound

## Problem and constraints

The problem specifies a four-peg Hanoi strategy: move the top k disks away using four pegs, move the remaining n − k disks using three pegs, then move those k disks onto the destination using four pegs. Choose the best recursive splits within this strategy. Inputs range from zero to 10,000 disks and continue until EOF. Zero disks require zero moves; large answers need exact big integers.

## Building the approach

Let F(n) be the best cost for the stated strategy. Name the middle three-peg group size m = n − k. Moving it takes `2^m − 1` moves, and the upper disks must be moved twice. Thus `F(0)=0` and `F(n)=min₁≤ₘ≤ₙ [2F(n−m)+2^m−1]`.

Compute n in increasing order so every smaller F value is ready. Trying every m up to n is unnecessary. First use m = 1 to obtain a feasible upper bound. Then increase m while its three-peg cost alone remains below the best known total. Once `2^m − 1 >= best`, even free movement of the upper disks cannot improve the answer, and all larger m have still greater three-peg cost.

This is a proved stopping condition, unlike guessing that the best split is halfway or limiting m to an arbitrary constant. Python integers preserve the full result.

## Walkthrough

F(1) is one. For two disks, m = 1 gives `2F(1)+1 = 3`. For three disks, m = 2 gives `2F(1)+3 = 5`, improving on seven from m = 1. At 64 disks, the recurrence gives 18,433 moves. The zero-disk query reads the initialized zero directly.

## Why it works

Every allowed strategy chooses some middle group size m. Its two four-peg subproblems can be optimized independently, while the three-peg cost is fixed, giving the recurrence. Enumerating splits therefore includes the best stated strategy. Increasing n ensures correct subproblem values. Pruned candidates have a three-peg cost already at least a feasible complete answer, so their full cost cannot improve it. This argument proves the optimum within the specified strategy without requiring a stronger theorem about every conceivable four-peg procedure.

## Complexity

With maximum query N and U = F(N), each n considers O(min(N, log(U+1))) candidates. There are O(N min(N, log(U+1))) big-integer operations and N + 1 stored big integers. Actual arithmetic and output costs depend on answer bit lengths.

## Common mistakes

- Applying the three-peg formula directly.
- Counting the upper-disk transfer only once.
- Always splitting the disks in half.
- Truncating the split search without a cost proof.
- Storing the 10,000-disk answer in a fixed-width integer.
