# Combine finite wallet payment with unlimited shop change

## Problem and constraints

The customer owns limited quantities of 5, 10, 20, and 50 cent, one-dollar, and two-dollar coins. The shop has unlimited quantities of all six denominations. For a price below five dollars in five-cent increments, minimize the number of coins paid plus the number returned as change. Exact payment is not required. The wallet has sufficient value. Six zero stock counts terminate input before a price, and answers are right-aligned in width three.

## Building the approach

Scale money by five cents, producing coin values `1,2,4,10,20,40` and a target below 100. Split a transaction at its payment amount `p`: `own[p]` is the minimum finite-wallet coins that form `p`, and `shop[p-target]` is the minimum unlimited-shop coins for the change. The answer is the minimum sum over `p>=target`.

We still need a proven payment limit. Greedily take wallet coins from largest to smallest only until some payment reaches the target. This is not claimed optimal; it constructs one valid transaction using `B` total paid and returned coins. Any better transaction pays at most `B` coins, each worth at most 40 units, so its payment is at most `40B`. Searching through that bound cannot omit the optimum.

For the wallet, cap each stock at `B`, split its count into binary groups, and run descending 0/1 knapsack. For shop change, run ascending unbounded coin-change DP.

## Walkthrough

For a 55-cent price, owning one dollar and one five-cent coin permits paying 1.05 and receiving 50 cents: three exchanged coins. Paying only one dollar requires 45 cents change, which can take four coins and is worse.

If a wallet has ninety-nine five-cent coins and the price is 4.95, all ninety-nine may be necessary. The solution cannot assume a large denomination exists or that the answer is one digit.

## Why it works

The constructed transaction is legal because the wallet's total suffices and the shop can make every scaled change using value one. Thus its `B` is a valid upper bound on the optimum. An optimal transaction exchanges at most `B` coins and therefore pays no more than `40B`, proving the truncation safe.

Binary groups can represent every count from zero through the capped stock, and descending updates use each group at most once, so `own` exactly models finite payment. Ascending shop updates allow unlimited reuse and find minimum change coins. Every transaction has one payment `p`; optimizing both sides for each `p` and taking the minimum therefore yields the global optimum.

## Complexity

With `M=40B`, six fixed denominations, wallet DP takes `O(M log(B+1))`, shop DP takes `O(M)`, and storage is `O(M)`.

## Common mistakes

- Considering exact payment only.
- Treating the customer's finite wallet as unlimited.
- Minimizing paid coins without adding returned coins.
- Choosing an arbitrary payment cutoff without proof.
- Parsing decimal money through binary floating point and truncating.
