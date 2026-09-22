Calling `split` on each individual line handles internal whitespace, while an empty line produces an empty token list and therefore an empty set. The outer loop advances exactly two lines per case.

The code tests `==` first, followed by Python's two strict set-subset comparisons. `isdisjoint` is reached only when equality and containment do not apply. Fixed messages preserve capitalization and punctuation. No logic assumes sorted, positive, or fixed-width integers.
