Process boxes from largest serial to smallest. Already selected boxes form a legal upper stack, and the current smaller-serial box may be added only underneath it.

Let `best[h]` be the minimum total weight among legal upper stacks of height h using processed boxes. Initialize the empty stack with height zero and weight zero; all other states are unreachable.

If `best[h] <= load[i]`, box i supports that entire upper stack and creates height `h+1` with total weight `best[h]+weight[i]`. Keep the smaller weight for the new height. Update heights downward so the same current box cannot become both source and destination in one iteration.

Keeping only minimum weight is safe because a lighter stack of equal height is never harder for any later bottom box to support.

Process serial numbers backward, adding each new box under an existing stack. For each height retain the lightest feasible stack, which is easiest for a later bottom box to support.
