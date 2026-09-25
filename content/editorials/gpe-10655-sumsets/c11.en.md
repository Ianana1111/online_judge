Four nested loops are too expensive. Rewrite the equation as `a + b = d − c`, splitting the work into two pairs. Precompute every unordered pair of distinct indices, storing its sum and both indices, then sort these records by sum.

Sort the original values too, and try d from largest to smallest. For each c distinct from d, binary-search pair sums equal to `d − c`. The stored indices must also avoid c and d; arithmetic equality alone does not guarantee four distinct elements.

Do not keep just one pair per sum. That representative might overlap c or d while another pair is valid. Keeping all pairs does not make equal-sum scanning quadratic here: because input values are distinct, an element has only one possible complement for a fixed sum. Equal-sum pairs therefore share no indices. The two forbidden indices can invalidate at most two pairs; a third one, if present, is usable.

Sort every pair sum together with its two indices. Try d from largest down, binary-search pairs summing to d−c for each c, and reject any reused index. Packing indices into integers keeps memory use modest.
