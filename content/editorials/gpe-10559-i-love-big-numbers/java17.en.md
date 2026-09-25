We cannot recover exact decimal digits from an overflowed integer or a floating-point approximation. Instead, represent the factorial as an array of decimal digits and implement the same multiplication used on paper.

Store the least significant digit first. Starting from the array `[1]`, multiply successively by 1, 2, ..., 1,000. For each digit, compute `digit * n + carry`, keep its remainder modulo ten, and pass its quotient by ten to the next position. After the old digits end, append every remaining carry digit.

There is no need to recompute a factorial for each query. After multiplying by n, sum the digits and save that answer at index n. The factorial array advances only during preprocessing; queries become table lookups.

After each multiplication, sum the current decimal digits and store the answer for that n factorial.
