Begin with every candidate pair 1≤x<y≤n. The first speaker knows the sum; the second knows the product. A sum or product appearing in exactly one remaining pair lets its speaker identify the answer immediately.

An ignorance statement rules out every candidate whose value is unique for that speaker. Remove all such pairs simultaneously, then switch speakers. After m preceding ignorance statements, the next speaker knows, so output pairs that first become unique at round m. Round zero represents knowledge before any ignorance statement.

Count all current candidates before removing any. Updating frequencies while deleting would incorrectly give later candidates information that has not yet been announced. round_known records the first knowing round, while unresolved candidates contribute to subsequent frequency counts.

If two consecutive rounds remove nothing, both speakers have checked without gaining information; the candidate set will never change again. Reuse results for repeated n, with bounded caches in Python/Java to prevent many distinct n values from retaining excessive data. There are O(n²) candidates and at most 101 rounds: O(101n²) time and O(n²) storage per result.
