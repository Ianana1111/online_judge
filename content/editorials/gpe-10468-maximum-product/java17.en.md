A negative running product looks unpromising, but multiplying by another negative number can make it the best answer. That makes a direct copy of a maximum-subarray-sum rule unsafe. Before designing a more elaborate state, look at N: even at 18, there are only 171 nonempty intervals.

Enumerate a left endpoint, start a product at one, and extend the right endpoint one position at a time. Each extension needs only one multiplication because the previous product already contains the rest of that interval. Compare every product with an answer initialized to zero.

Do not stop on a negative product. After zero, products for that fixed left endpoint stay zero, but later left endpoints still explore intervals entirely to the right of it. No interval is allowed to jump over the zero.

Extend a product from every left endpoint to cover all contiguous subarrays; keep answer at least zero as the problem requires.
