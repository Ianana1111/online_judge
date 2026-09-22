`digits{1}` represents both the starting value and 0!. The separate assignment `sums[0] = 1` records that boundary answer before the multiplication loop begins.

The reference loop uses `int &digit`, replacing each old digit with the corresponding product digit. It is safe to update in place because multiplication proceeds from low to high and needs only the old current digit plus the carry. Any new high digits are appended afterward, so vector growth never invalidates the loop's active references.

The `while (carry)` loop can append several digits, not just one. Once the entire product is complete, a separate pass accumulates the digits into the zero-initialized `sums[n]`. Queries then use only this table, leaving the large final factorial untouched.
