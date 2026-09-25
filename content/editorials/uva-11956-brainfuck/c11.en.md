Store a 100-element integer array and one pointer. Move right with `(pointer+1)%100` and left with `(pointer+99)%100`. Increment a cell with `(value+1)%256` and decrement with `(value+255)%256`. Adding the period before modulo avoids negative C++ remainder.

The requested output is only the final memory dump. A dot is an original-language output command but does not alter state and must not emit extra intermediate text here.

Wrap the pointer across 100 cells and each value modulo 256; print every cell as two uppercase hexadecimal digits.
