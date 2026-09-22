# Separate normalized sort keys from original CSV text

## Problem and constraints

Each dataset contains comma-separated alphanumeric text lines. Sort by the first field, then the second, and so on, using lexicographic order. Leading and trailing spaces in each field are ignored for comparison, while internal spaces matter. Output must preserve every original line and all of its spaces. There may be 100 datasets, 1,000 lines per dataset, 20 fields per line, and field lengths up to 128.

## Building the approach

Comparison and output demand two different representations. Store `original` as the untouched input line and build `key` as a vector of fields trimmed only at both ends. Sorting moves the whole record but compares only keys.

Commas always separate fields; there is no quoted-field escape rule. Vector lexicographic order compares the first differing field and places a shorter all-equal prefix first, exactly matching the requirement. Fields remain strings, so `10` sorts before `2`; numeric conversion would change the rule.

For identical keys, retaining the original index gives deterministic stable output, although the checker permits any equal-key order. Print `original` directly instead of reconstructing it from normalized fields.

## Walkthrough

`a, b` and ` a , b ` share the same key but must retain their distinct spaces. The one-field key `a` precedes `a, b` because it is a shorter equal prefix. Between `a, z` and `a, b`, the second field decides that the latter comes first.

## Why it works

Splitting at every comma preserves field boundaries, and trimming only outside spaces yields exactly the content specified for comparison. Standard vector lexicographic comparison applies the required field-by-field rule, including prefix length.

Every record keeps one independent untouched original, and sorting only permutes complete records. Thus no line is removed, merged, or reformatted. The index tie-break selects a permitted order without altering the primary comparison.

## Complexity

For `M` lines, `L` fields, and maximum field length `W`, key construction takes `O(MLW)`. Sorting takes `O(M log M)` comparisons of up to `O(LW)`, for `O(MLW log M)` total time and `O(MLW)` storage.

## Common mistakes

- Comparing numeric-looking fields numerically.
- Printing rebuilt trimmed fields and losing original spaces.
- Comparing only the first field.
- Removing internal spaces as well as outside spaces.
- Deduplicating records with equal keys.
