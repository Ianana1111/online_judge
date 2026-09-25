Because `10` is congruent to one modulo nine, an integer and its digit sum have the same remainder modulo nine. Sum the input characters directly without converting the huge number.

If the first sum is not divisible by nine, report failure. Otherwise set degree to one for this first digit-sum layer. While the sum is not nine, take its digit sum again and increment the degree. The first sum is at most 9000, so subsequent work fits easily in `int`.

A positive multiple of nine cannot reduce to zero; repeated digit sums eventually reach the only positive one-digit multiple of nine, which is nine.

Keep the original string for output rather than parsing a number too large for machine integers.
