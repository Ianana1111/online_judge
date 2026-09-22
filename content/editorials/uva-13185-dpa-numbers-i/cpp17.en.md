`sum` is initialized after reading each new `n`, so cases remain independent. The strict `d<n` loop excludes the number itself without a later correction.

The first branch handles strict deficiency, the second equality, and the final branch necessarily abundance, producing exactly one classification. Divisibility uses integer remainder only. A square-root divisor method would be useful for much larger input, but direct enumeration is clearer and sufficient here.
