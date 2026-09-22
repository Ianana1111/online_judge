Prices and the target use `long long`, so pair addition is performed in that type. Sorting places all remaining candidates between `left` and `right`.

The three branches correspond directly to the elimination proof: increment `left` for a small sum, decrement `right` for a large sum, and save both prices before moving inward on equality. The loop condition is strictly `left < right`.

`first` and `second` are overwritten on each exact match because each later match is at least as balanced. The guaranteed existence of a solution ensures they are assigned before output. Since the array is sorted, the saved smaller price is printed first in the exact required sentence.
