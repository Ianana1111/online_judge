Each gopher needs one hole and each hole holds one gopher: a bipartite maximum-matching problem. Put gophers on the left, holes on the right, and connect a pair only if the gopher can reach that hole in time.

Compare (x−a)²+(y−b)²≤(seconds·speed)² without square roots. Equality is reachable. Binary floating-point can misclassify close boundaries; C/C++ scale finite decimals by a shared 10^k and compare arbitrary-precision integer squares. Java uses exact BigDecimal multiplication/addition and compareTo. Scale the running distance too.

owner[hole] records its current gopher. When a new gopher wants an occupied hole, recursively try moving its resident elsewhere. Only after that succeeds may the new gopher take it. This augmenting path can rearrange earlier choices rather than losing a gopher because a first assignment was unlucky.

Reset seen for each new augmentation attempt. Within an attempt, never retry an already visited hole, preventing cycles. Each success saves one additional gopher; output n−saved.

There are at most n·m edges. Standard augmenting matching has a conservative O(n²m) time bound and O(nm) space, plus arbitrary-precision squared-distance costs. C/C++ preserve all decimal digits and handle ordinary scientific notation through scale conversion, without adding an artificial distance epsilon.
