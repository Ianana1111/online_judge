`ways[0]=1` denotes one empty combination, not one coin. The increasing sum loop lets `ways[sum-coin]` already contain the current denomination, implementing unlimited use.

The amount token is split at the decimal point, and appending two zeros lets one- or two-digit fractional text be read uniformly. Reconstructing `amount` from integer cents guarantees exactly two decimal places. Separate `setw` calls align the six-character amount and seventeen-character count; each width applies only to the next output item.
