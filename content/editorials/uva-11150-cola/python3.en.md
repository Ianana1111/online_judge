For every exchanged drink, three empties leave and one returns after drinking. That is a net cost of two empties. Starting with `N` empties gives at most `N // 2` extra drinks. A borrowed bottle can complete the last exchange when two empties remain, and the new empty repays the loan.

No debt simulation is needed: print `N + N // 2` for each value until EOF. Integer division discards the unusable final single empty.
