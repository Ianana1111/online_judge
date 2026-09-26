This is not matrix-chain optimization: parentheses already prescribe the multiplication strategy. An a×b matrix times a b×c matrix yields an a×c matrix and costs a·b·c scalar multiplications. Unequal inner dimensions make the entire expression invalid.

Push a matrix's dimensions when reading its name. At a closing parenthesis, both child results are ready: pop the right and left dimensions, check left.columns=right.rows, add this multiplication's cost, and push the result dimensions. Opening parentheses require no arithmetic because the fully parenthesized binary grammar determines each merge.

Store dimensions only, not matrix entries. Any incompatible inner product produces error; compatible outer dimensions cannot repair it. A single matrix requires no multiplication and has cost zero.

Dimensions have no stated magnitude bound and cost multiplies three of them. C/C++ use decimal-string multiplication/addition and Java uses BigInteger. Allocate the stack from expression length rather than imposing a fixed recursion depth. Scan E symbols once, with extra arbitrary-precision work at each merge. The stack has O(E) entries containing known or intermediate result dimensions.
