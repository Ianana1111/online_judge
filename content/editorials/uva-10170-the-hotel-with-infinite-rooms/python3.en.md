If the last included group has size k, total occupied days are

`S+(S+1)+...+k = (k-S+1)(S+k)/2`.

This function is strictly increasing in k. The answer is therefore the smallest k whose cumulative total is at least D.

Binary-search the inclusive interval from S through `10^8`. Even from the largest allowed S, that upper endpoint accumulates beyond `10^15`, so it covers every answer. Products stay below signed 64-bit range and can be compared exactly without floating roots.

The arithmetic sum counts days through group `mid`; the answer remains inside `[low, high]`.
