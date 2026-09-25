Strong matches have no ambiguity, so count them by comparing corresponding positions. To count every match without reusing duplicates, count how often each digit occurs in the secret and guess.

For digit `d`, at most `min(secretCount[d], guessCount[d])` copies can be paired, and that many pairs are always attainable because their precise positions do not matter for the total. Summing this minimum over digits 1 through 9 gives `total`, which includes both strong and weak matches. Therefore `weak = total - strong`.

Keeping a strong pair never reduces the maximum total: it removes one identical value from both sides, exactly decreasing the possible count for that digit by one. This also explains why subtracting the strong count leaves the maximum number of valid off-position matches.

Count exact-position matches first; sum minimum digit frequencies for all matches, then subtract exact matches for weak matches.
