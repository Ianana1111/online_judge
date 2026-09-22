# Count shapes and labels as two separate choices

## Problem and constraints

Use n distinct elements as the labels of all nodes in a binary tree and count the resulting trees, for 1 ≤ n ≤ 300. Left and right children are distinct positions; a node may have only one child. There is no binary-search-tree ordering rule. Print the complete integer answer. Zero ends input.

## Building the approach

First ignore the labels. A root with n total nodes can have i nodes on the left and n − 1 − i on the right. The two subtree shapes can be chosen independently, giving `Cₙ = Σ Cᵢ Cₙ₋₁₋ᵢ`, with `C₀ = 1`. These are the Catalan shape counts.

Now restore the labels. For one fixed shape, the n distinct elements can be assigned to its n positions in n! ways. No search-tree rule restricts those assignments. Thus `Tₙ = Cₙ n! = (2n)!/(n+1)!`.

Rather than recomputing factorials for every query, use the ratio of neighboring answers: `Tₙ = Tₙ₋₁ (4n−2)n/(n+1)`. Precompute from `T₀ = 1` through 300 with exact integers. Multiply the complete numerator before dividing; an individual factor need not be divisible by n + 1.

## Walkthrough

For n = 1 there is one tree. For n = 2 there are two shapes, one with a left child and one with a right child. Each has two label assignments, giving four trees. For n = 3 there are five shapes and six assignments per shape, giving 30. Returning five would omit labels; returning six would omit shape choices.

## Why it works

Each nonempty ordered binary tree has a unique root and ordered pair of subtrees, so classifying by left-subtree size counts each shape once. For each shape, bijections from distinct labels to node positions give exactly n! labeled trees. Different shapes or different assignments produce different results. The adjacent-answer recurrence follows algebraically from this count, so exact multiplication and division reproduce every Tₙ.

## Complexity

There are 300 big-integer recurrence steps. With D digits in the largest answer, multiplying and dividing by these small factors takes roughly O(300D) digit work. Storing all answers takes O(300D) space; each query prints O(D) characters.

## Common mistakes

- Returning only the Catalan number.
- Treating left and right children as interchangeable.
- Imposing a binary-search-tree label order.
- Performing a partial integer division too early.
- Storing the answer in fixed-width or floating-point types.
