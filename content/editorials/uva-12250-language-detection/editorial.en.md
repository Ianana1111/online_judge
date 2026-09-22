# Match each greeting by exact dictionary lookup

## Problem and constraints

Each input word is an uppercase greeting of at most 14 letters. Exactly six specified greetings map to six language names; every other word maps to `UNKNOWN`. A line containing `#` terminates input and receives no case number or output.

## Building the approach

Store the six complete word-to-language pairs in a dictionary: `HELLO`, `HOLA`, `HALLO`, `BONJOUR`, `CIAO`, and `ZDRAVSTVUJTE`. Look up each input as a complete key. Print the associated language when present and `UNKNOWN` otherwise.

No fuzzy language detection is needed. Near matches such as `HELLOO` or `HELL` remain unknown, while `HELLO` and `HALLO` must map to different languages despite differing by one letter.

## Walkthrough

For `HELLO`, `HALLO`, `HELLOO`, and then `#`, the program prints `ENGLISH`, `GERMAN`, and `UNKNOWN` as cases 1, 2, and 3. The terminator only stops the loop. Repeated `HOLA` lines each form a separate Spanish case.

## Why it works

The dictionary contains every known greeting and its exact required result. Complete-string equality returns the correct language precisely for those six keys. Failure to find a key means the word differs from every recognized greeting, for which the required output is `UNKNOWN`. Testing `#` before output keeps it outside case numbering.

## Complexity

With six fixed entries and maximum length 14, time and extra space per input are effectively `O(1)`. More generally, an ordered map lookup costs `O(L log K)` for word length `L` and `K` keys.

## Common mistakes

- Guessing from a prefix and confusing the greetings beginning with `H`.
- Accepting approximate spellings.
- Using map indexing and printing an empty value for unknown keys.
- Printing an `UNKNOWN` case for `#`.
- Using the wrong case-label or language capitalization.
