Use `getline` so spaces and empty lines are preserved. Remove a trailing carriage return from Windows line endings, but leave genuine leading and trailing spaces untouched. Create a fresh 128-entry count array and increment by character code.

Collect only positive-frequency codes from 32 through 127. Sort with an explicit two-key comparator: smaller count first; when counts match, larger code first. Print numeric codes rather than the character glyph.

Track whether a line has already been processed to emit one blank line between cases. This must be based on cases, not on whether the previous line contained characters.

Count ASCII characters per line; sort by increasing frequency and decreasing code for ties.
