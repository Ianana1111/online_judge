`answer = 1` selects the first element, and `needDown = true` encodes the mandatory first comparison. Only a value satisfying the current direction increments the answer and toggles the direction.

`last` is assigned on every iteration. After a successful comparison it is the new endpoint; otherwise it replaces the old endpoint with a more useful peak or valley. Since the input is a permutation, equal values need no separate handling. A one-element case naturally returns 1.
