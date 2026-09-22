After reading `n`, `ignore` consumes through the rest of its line so the first `getline` obtains the first actual record. Each record creates its own `istringstream`; extracting only `country` is enough, and unused name words cannot spill into another line.

`++counts[country]` inserts a missing key with value zero before incrementing it, then updates the same entry on future records. `std::map` maintains string keys in lexicographic order.

The range loop therefore prints one line per country with its name, one space, and its count. It does not print personal names or add an unrequested case heading.
