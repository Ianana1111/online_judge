Both counters are initialized inside each case. Prefix increment occurs before adding streak, ensuring the first O of every run scores one.

The X branch modifies only streak. Since input contains only O and X, the `else` precisely means a break. The solution stores neither individual scores nor run lengths and prints one total per result string.
