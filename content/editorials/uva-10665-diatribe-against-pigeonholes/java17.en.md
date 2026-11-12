Input is parsed manually with `DataInputStream` and a 64 KB buffer: `nextNonSpace` skips spaces, newlines and `\r` and returns the next character, and `nextInt` builds integers from it. The parcel string is read by repeatedly taking the next non-space character until `#` or end of input, counting only the first n letters.

`ranked` is sorted ascending with `Arrays.sort` and then reversed in place into decreasing order. `take(a, b)` scans from A for the first unused worker whose count is a or b, which is the smallest letter currently allowed.

Each left tier picks a letter and stores the other count in `rightNeed[k]`, the middle takes the smallest count when N is odd, and the right half is filled into `order[n-1-k]` from the inside out. Both lines go into a `StringBuilder`, printed once at the end.
