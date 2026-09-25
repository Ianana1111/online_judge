A long chain of character-specific conditions would be tedious to write and easy to mischeck. The conversion rule depends only on keyboard position, so we should store the four keyboard rows and generate the mapping from their indices.

For every row and every position `i >= 2`, set `decode[row[i]] = row[i-2]`. Keeping rows separate prevents an invalid mapping from the beginning of one row into the end of another. Once the table exists, each message character takes one lookup.

Messages must be read with `getline` so spaces remain exactly where they appeared. After reading `N` with `operator>>`, discard the rest of that line before the first `getline`. For each character, convert letters to lowercase for lookup; if the table has no entry, preserve the original character. This naturally keeps spaces unchanged.

This task moves two keys left; lowercase uppercase input first while leaving spaces unchanged.
