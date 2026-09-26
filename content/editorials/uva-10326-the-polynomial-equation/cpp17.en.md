A root r contributes a factor (x−r). Multiply all such factors and fix the leading coefficient at one to obtain the required unique monic polynomial. Repeated roots contribute repeated factors, and a zero root contributes x.

Store the coefficient of x^d in coefficient[d]. Multiplying P by x shifts coefficients up one degree, while multiplying P by −r scales coefficients in place. Thus updated[d]=coefficient[d−1]−r·coefficient[d], treating missing coefficients as zero. Start with constant polynomial one and perform one update per root.

Use a separate updated array: overwriting an old coefficient prematurely would corrupt later reads. C/C++ store signed decimal strings and Java uses BigInteger, preserving intermediate coefficients rather than assuming the final output bound protects every intermediate operation.

Print from highest degree down. Omit zero nonconstant terms, omit coefficient magnitude one before x, and omit ^1. Always print the constant, including zero, with the required spaces and signs between terms. Finish with = 0. For n roots, O(n²) coefficient updates are required, with additional arbitrary-precision multiplication costs; memory holds O(n) coefficients in the old/new rows.
