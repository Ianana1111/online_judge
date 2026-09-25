Reverse the return trip mentally. We now need two left-to-right paths. A small stone can belong to only one path, while a big stone can be used by both.

Represent that capacity directly in a sorted list: insert each small stone once, each big stone twice, and each riverbank twice. Give even-indexed entries to one path and odd-indexed entries to the other. Consecutive stops on either path are two indices apart in the combined list, so the largest jump is the maximum of `points[i] - points[i-2]`.

Duplicating both banks matters because both paths must begin and end there. It also makes the same formula handle an empty river or a single small stone without special cases.

Reverse the return trip into a second left-to-right path. Duplicate big stones and both banks, keep small stones once, then maximize each two-index gap.
