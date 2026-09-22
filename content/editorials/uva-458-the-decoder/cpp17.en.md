`cin.get` preserves every input byte, including encoded spaces. LF and CR take the direct output branch; all other legal input characters enter the rotation.

Converting through `unsigned char` gives a nonnegative code before subtracting seven. Values below printable code 32 receive one full 95-character cycle. The result is written immediately as a `char`, with no added spaces or line endings. One arithmetic path handles letters, digits, punctuation, and spaces uniformly.
