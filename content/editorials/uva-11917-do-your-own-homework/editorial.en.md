# Look up the subject before classifying its completion day

## Problem and constraints

A friend lists distinct subjects they can complete and required days. For requested homework with deadline `D`, output `Yesss` when it takes at most `D`, `Late` when it needs at most five additional days, and `Do your own homework!` otherwise or when the subject is unknown.

## Building the approach

Build a map from subject name to completion days. Use `find` for the requested subject. Absence immediately gives the rejection message. For a found subject, classify days into `<=D`, `D+1..D+5`, or above `D+5`.

Avoid reading with `days[wanted]`: map subscripting inserts a missing key with zero and could make an unknown subject appear finishable on time.

## Walkthrough

For deadline 10, requirements 10, 11, and 15 produce `Yesss`, `Late`, and `Late`; 16 is rejected. A subject absent from the list is rejected regardless of a generous deadline.

## Why it works

Unique subject names make the stored value the exact completion time. Missing names correspond directly to the failure case. Every positive completion time belongs to exactly one of the three disjoint intervals ending at `D`, `D+5`, or above, and each branch prints the matching required message.

## Complexity

With `N` subjects, ordered-map construction is `O(N log N)` and lookup `O(log N)`, ignoring bounded string length. Storage is `O(N)`.

## Common mistakes

- Subscript-looking up an unknown subject and inserting zero days.
- Treating the exact deadline as late.
- Rejecting the fifth grace day.
- Printing `Late` for an unknown subject.
- Misspelling the exact output messages.
- Reusing one subject map across cases.
