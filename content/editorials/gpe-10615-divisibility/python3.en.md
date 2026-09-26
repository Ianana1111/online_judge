The value at (x₁,...,xₙ) counts unit-step paths from the origin: (Σxᵢ)!/∏xᵢ!. A prime P does not divide this multinomial coefficient exactly when adding the base-P representations produces no carry. Thus every digit position must have a coordinate-digit sum below P.

Count valid coordinates digit by digit, from most significant to least. Each coordinate has two flags: whether its prefix is still equal to the lower bound and whether it is still equal to the upper bound. A tight flag restricts the next digit; once the prefix leaves that boundary, the corresponding restriction disappears. Every digit position must satisfy the no-carry condition.

Within one position, choose coordinate digits one at a time and track their partial sum. Discard sums reaching P. For a fixed flag transition, allowed digits form a consecutive interval, so a sliding-window sum performs the convolution efficiently.

C/Java `transfer` implements this interval convolution. Python packs the P partial-sum coefficients into an integer, spaced 80 bits apart. Multiplication by a 0/1 interval polynomial performs the same convolution. A coefficient's total contribution is bounded by 4^N P^N (MOD−1), below 2^80 under the stated limits, so coefficients cannot carry into one another. Reduce modulo MOD after each position and truncate coefficients for sums≥P.

For D base-P digits, C/Java take O(D·N·4^N·P) time and O(4^N·P) space. Python uses the same states and exact coefficients, delegating short convolutions to arbitrary-precision integer multiplication.
