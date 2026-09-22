`getline` removes LF but may retain a preceding CR, so only a final CR is removed; genuine spaces remain. Iterating as `unsigned char` guarantees a nonnegative array index, and valid input stays within the 128-entry table.

Only positive-frequency codes enter `codes`. The comparator orders unequal counts ascending and equal counts by code descending. The `first` flag advances after every input line, including an empty one, so case separators remain correct. Output prints integer `ch` followed by its count.
