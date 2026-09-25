The next desired position depends on how many letters have been successfully extracted, not on how many words have been read. Let the current decoded string have length `k`. The next needed character is index `k` in zero-based notation.

Scan the words on one line. If `word.size() > k`, append `word[k]`; the decoded length then automatically advances to the next position. Otherwise ignore the word and keep the same `k`. Recreate the decoded string for every line.

Read input by complete lines first, then split each line into words. This preserves both the point where `k` must reset and the blank lines that separate test cases.

For each line select character 1, 2, 3… from successive words; skip a word that is too short without advancing the index.
