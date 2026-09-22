# Toggle opening and closing TeX quotes across the entire stream

## Problem and constraints

Replace ordinary double quotes in occurrence order: the first with two backticks, the second with two apostrophes, then alternate. The total quote count is even and input continues to EOF. Preserve every other character, including whitespace and newlines; a quoted passage may cross lines.

## Building the approach

Maintain one boolean saying whether the next double quote opens or closes. Start opening. Read every byte-like character with `get`; on a double quote print the corresponding two-character TeX marker and toggle, otherwise print the character unchanged.

The state spans the whole stream and is not reset at newline. Existing apostrophes and backticks are ordinary characters and do not affect it.

## Walkthrough

If an opening quote appears near the end of one line and its mate on the next, the second still becomes closing apostrophes. Two consecutive double quotes become an empty opening/closing pair. Text without quotes is reproduced exactly.

## Why it works

After k processed double quotes, the flag is opening exactly when k is even. It holds initially and toggles once per quote, so odd occurrences become openings and even occurrences closings. Every nonquote is copied in original order, proving no other text changes.

## Complexity

For input length L, time is `O(L)` and extra space `O(1)` with streaming output.

## Common mistakes

- Resetting at each line.
- Using formatted character input that skips whitespace.
- Replacing every quote in the same direction.
- Toggling on apostrophes.
- Adding a newline not present at EOF.
