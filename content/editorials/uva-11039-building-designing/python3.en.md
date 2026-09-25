Sort by absolute size from small to large, viewing the building from top toward bottom. Size order is now automatically valid. The remaining task is the longest alternating-color subsequence.

Group consecutive sorted entries of the same color. At most one floor can be chosen from a color run: two selections from the same run have no opposite-colored, intermediate-size floor available between them. Conversely, choosing one floor from every run creates a valid alternating sequence because adjacent runs have different colors and increasing sizes.

Therefore scan the sorted list and increment the answer whenever color changes. Compare signs only; distinct same-color sizes remain in one run.

Walk through absolute heights and take a floor when its color differs from the last selected one. Python stores one byte per possible size instead of half a million integer objects to stay within memory.
