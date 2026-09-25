The requirement concerns multiplicities of directed pairs, not only whether a reverse direction exists. Store every request `(A,B)` in `forward` and its reversal `(B,A)` in `backward`. Sort both vectors and compare them element by element.

Equality means every directed pair occurs exactly as many times as its reverse, so all students can be paired. Do not replace pairs by `(min,max)` or a set, because that destroys direction or multiplicity.

Balancing total departures and arrivals at each location is insufficient: a directed cycle `A->B`, `B->C`, `C->A` balances cities but offers no direct reciprocal partners.

For every A→B request there must be the same number of B→A requests, including duplicates. Java packs two `int` values into one `long` to avoid allocating hundreds of thousands of small objects.
