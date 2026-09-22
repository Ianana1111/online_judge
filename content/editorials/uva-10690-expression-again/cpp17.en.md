The zero-count bit at offset 2500 represents signed sum zero. As each input arrives, it is added to `total`, and count updates run downward only as far as both `k` and the number read so far.

Nonnegative values shift left and negative values shift right by their magnitude, matching the offset signed-sum encoding. The fixed 5001-bit range covers every legal sum.

Only `possible[k]` is scanned after input, excluding selections of the wrong size. `1LL` promotes product arithmetic before multiplication, and `LLONG_MIN`/`LLONG_MAX` initializers correctly support all-positive, all-negative, or mixed products.
