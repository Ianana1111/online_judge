# Test ordinary reversal and mirrored reversal independently

## Problem and constraints

Each input token has 1 to 20 uppercase letters or digits 1 through 9. Classify it according to two independent properties: whether it is an ordinary palindrome and whether mirroring every character and reversing the order reproduces the string. The mirror table is fixed, and some legal input characters have no mirror. Print one of four exact messages followed by a blank line.

## Building the approach

For every position `i`, compare it with position `n-1-i`. The ordinary palindrome condition is simply `text[i] == text[n-1-i]`. The mirrored condition requires a defined mapping for `text[i]` and equality between that mapped character and `text[n-1-i]`.

Maintain two booleans from true and clear each independently on its own failed comparison. The mirror map contains characters unchanged by reflection and both directions of the pairs `E <-> 3`, `J <-> L`, `S <-> 2`, and `Z <-> 5`.

The center of an odd-length string must also be checked. A center such as `A` mirrors to itself, while `E` mirrors to `3` and cannot stand alone at the center of a mirrored string.

## Walkthrough

`A` is both an ordinary and mirrored palindrome. `B` is an ordinary palindrome but has no mirror mapping. `E3` is not an ordinary palindrome, yet mirrored reversal reproduces `E3`, making it a mirrored string. `AB` satisfies neither property. These examples cover all four classifications.

## Why it works

All symmetric character pairs being equal is exactly the definition that the string equals its reversal, so the first boolean is correct. All mapped left characters matching their symmetric right characters is exactly the definition that mirrored reversal equals the original, so the second is correct. Since neither property implies the other, their four boolean combinations correspond one-to-one with the four required messages.

## Complexity

For length `L`, the algorithm takes `O(L)` time and `O(1)` extra space because the mirror table is fixed.

## Common mistakes

- Assuming every ordinary palindrome is mirrored.
- Storing only one direction of a mirror pair.
- Skipping the center character of an odd-length string.
- Treating digit zero as a legal mirrored input character.
- Using a default mapping for characters absent from the table.
- Omitting the blank line after each result.
