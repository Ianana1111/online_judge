The bracket expression denotes a whole sequence, not one arithmetic value. Start at the innermost form: [m] is the constant sequence m. Wrapping it as [m+child] starts with m and then adds each preceding child term. Wrapping it as [m*child] starts from m and successively multiplies every child term.

For example, [3+[2]] gives 3,5,7, while [3*[2]] gives 6,12,24. Their first terms differ, so their loops are not interchangeable: addition uses result[i−1], multiplication uses result[i].

Parse each outer constant/operator into frames until reaching the innermost constant sequence. Expand frames in reverse order. Each layer creates a separate updated array, preserving the complete child sequence while constructing its parent, then discards the old array. This separates parsing from recurrence evaluation without deep recursion.

C/C++ use signed decimal strings and Java uses BigInteger because terms may have a thousand digits. Keep only the current child and next parent arrays, using O(ND) numeric storage. L layers perform N updates each, with additional arbitrary-precision costs; grade-school multiplication gives a worst-case O(LND²) bound.
