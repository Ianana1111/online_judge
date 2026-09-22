The event map groups all insertions and removals by coordinate, so no special start-before-end ordering is needed inside one coordinate. The skyline is inspected only after that entire vector of changes is applied.

`active` is a multiset because separate buildings may share a height. A removal first obtains one iterator with `find`, then erases that iterator only. The permanent zero never has a removal event, keeping `rbegin()` valid.

`previous` stores the last emitted height. Output occurs only when `current` differs, while `first` controls the single spaces between numbers. One newline terminates the complete skyline.
