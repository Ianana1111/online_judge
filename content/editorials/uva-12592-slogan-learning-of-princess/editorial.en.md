# Preserve complete lines in a slogan-response dictionary

## Problem and constraints

Each learned slogan consists of a first line and its response line. Given 1 through 20 unique first lines and then up to 100 known queries, print the corresponding response for each. Lines may contain spaces and are at most 100 characters long.

## Building the approach

Store each complete first line as a dictionary key and the following complete line as its value. Read with `getline`, because token input would stop at the first space and misalign all remaining words.

After reading each numeric count with formatted input, discard the remainder of that line before the next `getline`. Preserve all content spaces; remove only a trailing carriage return that belongs to Windows line endings.

## Walkthrough

If `red blue` maps to `green gold` while `red` maps to `silver`, querying `red blue` must return the first response. Looking up only the first word would confuse these distinct keys. Repeated queries produce repeated response lines.

## Why it works

Construction records every unique full first line with exactly the full response that follows it. Each query is guaranteed present, and exact string lookup therefore selects its unique mapped response. Using the same complete-line representation during storage and lookup preserves spaces and prevents partial-key collisions.

## Complexity

For `N` slogans, `Q` queries, and maximum line length `L`, an ordered map uses `O((N+Q)L log N)` time and `O(NL)` space.

## Common mistakes

- Reading slogans with `>>` and losing text after spaces.
- Calling `getline` immediately after a numeric read and consuming the leftover newline.
- Using only the first word as the key.
- Normalizing spaces that are part of the line.
- Printing labels or the query text in addition to the response.
