# Start with an identity table and overwrite substitution pairs

## Problem and constraints

Each dataset gives a plaintext alphabet, its equal-length substitution alphabet, then complete text lines. Plaintext character `i` maps to substitution character `i`. Characters absent from the plaintext alphabet remain unchanged and case is significant. Empty lines separate datasets; lines containing spaces are still content. Output the substitution alphabet first, then plaintext alphabet, then transformed text.

## Building the approach

Create a 256-entry byte mapping initialized as `mapping[c]=c`. For each aligned alphabet position, overwrite the plaintext byte with its substitution byte. Then transform each content line by looking up every byte in order.

Identity initialization automatically preserves unmapped punctuation, digits, spaces, and case variants, avoiding special cases. Use full-line input so leading, internal, and trailing spaces survive. Only a truly zero-length line terminates a dataset; a line made solely of spaces must be processed. Rebuild the table for every case.

## Walkthrough

If plaintext alphabet `abc` maps to `bca`, text `abc` becomes `bca` and `cab` becomes `abc`. Uppercase `A`, commas, and digits remain unchanged unless explicitly listed. If a space appears in the plaintext alphabet, it too is substituted and must not be removed by trimming.

## Why it works

After initialization, every unspecified byte maps to itself, exactly matching the preservation rule. Overwriting aligned positions gives every listed plaintext character its unique required replacement. Applying this function independently to each text character preserves order and length while producing the specified substitution. Full-line processing preserves layout, and independent tables prevent rules from leaking across datasets.

## Complexity

For alphabet length `A` and total text length `L`, time is `O(256+A+L)` and the mapping uses constant `O(256)` space.

## Common mistakes

- Reversing the map from substitution alphabet back to plaintext.
- Replacing unmapped characters instead of preserving them.
- Folding case.
- Reading words or trimming lines and losing spaces.
- Printing alphabets in input order rather than substitution first.
