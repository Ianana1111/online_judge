The four strings encode keyboard rows; the second row's trailing backslash must be written as `\\` in C++. Mapping loops start at index one, preventing cross-row neighbors.

`decoded` begins as an identity table and is overwritten only for mapped keys, naturally retaining spaces. Array indices use `unsigned char` so no negative index is possible. `getline` preserves complete lines; a trailing carriage return from CRLF is removed before one normalized newline is printed.
