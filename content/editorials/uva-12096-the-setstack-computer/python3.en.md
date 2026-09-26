Nested sets are awkward to repeatedly expand. Assign a unique ID to each distinct set content; equal contents reuse an ID. An outer set then stores only integer IDs of its member sets.

Why does this preserve equality? Start with a fixed ID for the empty set. Every subsequently constructed set contains IDs of already known sets. Matching ID collections therefore mean matching member sets. By induction, structural equality is equivalent to ID equality.

PUSH places the empty-set ID and DUP copies the top ID. Other commands pop a first, then b. UNION/INTERSECT combine or retain member IDs. ADD inserts the set a itself as one member of b, so insert ID a rather than flattening a's members into b. Intern the result and push its ID.

Never mutate an interned set: doing so would change an old ID's meaning. C stores sorted distinct integer arrays and merges them with two pointers. Hash buckets accelerate lookup, but equal hashes still require complete content comparison, so collisions cannot affect correctness. Python uses frozenset; Java retains unmodifiable sets and constructs each result separately.

After each command print the top set's direct cardinality, not a recursive count. Print *** after every case, including zero operations. For U distinct sets and s members in an operation, merges and content hashing take roughly O(s); total memory is the sum of direct member counts across interned sets.
