A quadratic LCS table is too large. The crucial property is that every square occurs at most once in the prince's route. Store `position[value]`, its unique index there.

Read the princess's route in order. Ignore squares absent from the prince's route and replace every common square by its prince position. The princess order is already preserved by this scan. Selecting a sequence whose mapped positions strictly increase also preserves prince order, so the answer is the LIS length of the mapped sequence.

Maintain `tails`, where `tails[k]` is the smallest possible final position of an increasing subsequence of length `k+1`. Use `lower_bound` to replace the first tail not smaller than the new position, or append if none exists. A smaller tail preserves the attainable length while leaving more room for future positions.

Because neither route repeats a cell, map cells of the first route to positions. Read those positions in second-route order; a common subsequence becomes a strict increasing subsequence, found with binary-search LIS tails.
