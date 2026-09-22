`sum` and `types` start at zero. When more than one denomination exists, coin 1 is always selected because denominations strictly increase. The loop stops before the final coin so that `coins[i+1]` is always valid; the last type is added uniformly by printing `types + 1`.

The strict comparison mirrors the bank's behavior when a remainder can already pay for the next denomination. Skipping a coin leaves both state variables unchanged and preserves the smallest amount for the existing type count. A one-denomination case naturally prints 1.
