The duration table stores scaled integers, so the validity test uses exact equality. `sum` and `answer` are reset for every song.

On a slash, the program checks the accumulated duration before setting it back to zero; reversing those actions would discard the measure. The first slash sees zero and is harmless, while the last slash closes the last nonempty measure. The outer loop rejects the `*` sentinel before scanning it and prints one count per song.
