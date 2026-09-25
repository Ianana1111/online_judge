Sorting by numeric value fails: 3 should precede 30 because 330 is larger than 303. Ordinary lexicographic order can also fail when one string is a prefix of another.

Instead, compare the two possible local results. Put a before b exactly when `a+b > b+a`. These concatenations have the same length, so lexicographic comparison gives their numerical order. Sort using this rule and print every string consecutively.

An equal comparison is not an error: for 12 and 1212, either order yields the same digits. The comparator must use strict greater-than, not greater-than-or-equal, to satisfy the sorting contract.

Keep every duplicate input piece and concatenate all pieces after sorting.
