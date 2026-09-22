`endsWith` first verifies that the word is at least as long as the suffix, then compares the final substring. This safely handles short words even when testing `ch` and `sh`.

The map stores singular forms as keys and required plurals as values. `find` checks without inserting a missing key. The consonant-`y` branch performs its length test before reading the previous character, removes only the final `y`, and prints `ies`; all branches share one final newline.
