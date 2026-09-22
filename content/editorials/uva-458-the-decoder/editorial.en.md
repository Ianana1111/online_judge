# Rotate every printable ASCII character backward by seven

## Problem and constraints

Decode the stream through end of file while preserving line endings. This site's clarified encoding treats printable ASCII values 32 through 126 as a cycle of 95 characters: decoding moves backward by seven positions. If subtraction passes below 32, wrap by adding 95. Input spaces are encoded data, while LF and CR remain unchanged.

## Building the approach

Examples show that encoded `J` becomes `C` and an apostrophe becomes a space, both a difference of seven. Normalize printable codes by subtracting 32; decoding is then `(index - 7 + 95) % 95`.

The same operation can be implemented without an explicit modulo table: subtract seven from the character code, and when the result is below 32, add 95 once. Legal encoded values can cross the lower boundary at most once. Read character by character so spaces are not skipped. Branch on LF and CR first and write them unchanged.

## Walkthrough

`J` has code 74 and decodes to code 67, `C`. Apostrophe code 39 decodes to space code 32. Under this site's wrap rule, encoded space code 32 first becomes 25, then wraps to 120, which is `x`. Encoded `&` becomes `~` after the same wrap.

## Why it works

For every printable input, subtracting 32 places it on the cycle indices 0 through 94. Moving backward seven modulo 95 is precisely the inverse rotation defined by the site. The subtract-and-correct arithmetic computes that modular result, while copying line endings preserves stream structure. Applying it independently to every data character reconstructs the exact message.

## Complexity

For `L` input characters, decoding takes `O(L)` time and `O(1)` extra space in a streaming pass.

## Common mistakes

- Applying the common external nonwrapping interpretation instead of this site's explicit rule.
- Adding seven rather than subtracting it.
- Using cycle length 94 and omitting space.
- Reading with `>>` and losing encoded spaces.
- Rotating LF or CR and damaging line structure.
- Decoding only letters while ignoring digits and punctuation.
