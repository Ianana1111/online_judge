Result index zero is reserved for a possible highest carry, so the highest input digits initially accumulate at index one. The nested loops convert only individual characters to small values.

Carry propagation runs from the last cell toward index one, first adding the quotient leftward and then keeping the remainder. The leading-zero loop stops when one cell remains, guaranteeing output `0` for an all-zero array. Printing from `first` preserves every internal zero.
