`all_of` requires every entry to be zero. The set stores full vectors with order and values intact, and `insert(...).second==false` detects a prior identical state.

Every `next` entry reads only `state`; replacement happens after the complete loop, preserving simultaneous semantics and correct old first value for wraparound. A fresh seen set per test case prevents histories from mixing, and the program relies on actual repetition rather than an arbitrary step cutoff.
