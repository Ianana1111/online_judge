`getline` preserves every content character. The only removal is a trailing carriage return used by CRLF line endings; ordinary spaces remain untouched. Calling `getline` twice in the loop also preserves empty lines as one side of a case.

`previous` initially represents the empty prefix of `a`. At the start of each new row, `current[0]` is zero. Every other current entry is overwritten from left to right, so `current[j-1]` is already the correct same-row value while `previous[j]` and `previous[j-1]` still belong to the completed preceding row.

Swapping only after the row is finished makes `previous` the latest DP row. If `a` is empty, no swap occurs and the initialized zero row correctly supplies the answer.
