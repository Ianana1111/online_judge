Keywords are stored in an `unordered_set` and tested only as complete tokens. The `finish` lambda adds at most one point for the current token and then clears it; consecutive separators produce empty tokens, which cannot match a valid keyword.

`getline` preserves each original line, with only a possible carriage return from CRLF removed. Uppercase ASCII letters are lowered only while building `token`. Scores and `best` are reset per set, so an all-zero set prints every line. Ties are emitted in input order, one valid ordering under the semantic checker.
