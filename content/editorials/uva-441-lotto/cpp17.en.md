`chosen` is the exact current combination prefix. Each branch uses `push_back` before recursion and `pop_back` afterward, so sibling branches never retain one another's choices.

`needed = 6 - chosen.size()` includes the candidate about to be selected. The bound `i <= numbers.size() - needed` keeps the last feasible starting index; the equality is required. Printing adds spaces only between values. `firstCase` inserts one extra newline before every dataset after the first, creating exactly one separating blank line and no output for the zero sentinel.
