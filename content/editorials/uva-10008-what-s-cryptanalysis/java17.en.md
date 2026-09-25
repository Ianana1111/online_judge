Use a 26-element count array. Read complete lines rather than whitespace-delimited words, because empty lines still consume one of the declared inputs. For each character, map lowercase ASCII to uppercase, then increment only if it lies from `A` through `Z`.

Create an index list 0 through 25 and sort it with two keys: larger count first, then smaller index first. Walk that order and print entries whose count is positive.

The explicit tie key matters; first appearance order is unrelated to the required alphabetic order.

Count after uppercasing; break frequency ties alphabetically and omit letters with zero occurrences.
