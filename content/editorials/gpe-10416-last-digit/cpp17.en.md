`prefix[0]` starts at zero. For each i from 1 through 99, `term` starts at one and is multiplied by `i % 10` exactly i times, reducing modulo ten after every multiplication. Adding it to the previous prefix produces the required table entry without constructing a large power.

The sentinel check examines the entire input string for a nonzero digit. It runs before calculating the remainder, so strings representing 100 or 1,000 are not mistaken for zero. The decimal scan then maintains only the remainder modulo 100, and `prefix[remainder]` supplies the answer.

The table intentionally needs no entry for 100: one complete block contributes zero, already represented by `prefix[0]`.
