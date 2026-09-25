Sort a copy of each word's letters to create a signature. Two words are anagrams exactly when these signatures match, because sorting preserves every letter multiplicity. A set of distinct letters would be insufficient for words containing repeated letters.

Precompute dictionary signatures while keeping original dictionary strings separately. For a query, compute its signature, scan all dictionary entries, and collect every matching occurrence. Duplicate dictionary entries remain duplicate output records. If no match exists, print the required no-anagrams line rather than a numbered item.

A sorted-letter signature records every letter count. Equal signatures identify anagrams; print the original dictionary occurrences, including duplicates.
