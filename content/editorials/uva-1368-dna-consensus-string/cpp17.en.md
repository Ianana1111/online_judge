`alphabet="ACGT"` defines both count indices and correct lexical order. Every column creates a fresh four-entry count array, and legal input guarantees `find` returns a valid index.

`best` begins at A and changes only on a strictly larger count, preserving smaller ties. The selected letter is appended and `m-count[best]` adds mismatches. Output is exactly two lines per case with no extra separator.
