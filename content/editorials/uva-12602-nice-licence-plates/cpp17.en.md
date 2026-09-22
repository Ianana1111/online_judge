Indices zero through two hold the letters and index three is the hyphen, so `substr(4)` extracts exactly the four decimal characters. `stoi` uses decimal by default and accepts leading zeroes.

`letters` is reset for every plate and updated through three Horner steps. The integer difference is safely within range, and `<=100` includes the required boundary. Output uses only the exact lowercase phrases specified by the problem.
