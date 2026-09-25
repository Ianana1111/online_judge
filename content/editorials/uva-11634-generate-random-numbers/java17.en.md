Every state lies from 0 through 9999, so use a Boolean array of size 10,000. While the current state is unseen, mark and count it, then generate the next state. Stop at the first previously seen value.

The middle four digits can be extracted arithmetically: divide the square by 100 to drop its final two digits, then take modulo 10,000 to retain the next four. Conceptual leading zeros do not affect this expression.

Allocate a new `seen` array for each case; previous cycle history must not leak.
