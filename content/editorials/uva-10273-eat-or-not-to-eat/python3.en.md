Only a uniquely least productive cow is eaten. If the minimum is tied, nothing happens that day. Individual periods are at most 10, so the entire production pattern repeats every L=lcm(T₁,...,Tₙ) days, with L≤2520.

If no cow is eaten for L consecutive days, the survivor set is unchanged and the production phase returns to its start. The same ties will repeat forever, so stop. An elimination resets this idle counter and records the last elimination day.

Scanning every surviving cow daily would be wasteful. Preorder cows by production for each phase and maintain the first two surviving positions. Skip dead cows without sorting again. The first cow is uniquely minimal only if its production is less than the second's; a lone survivor is also eaten.

Use counting sort over milk values 0..250, and store cow indices in short integers. `first` and `second` only advance, skipping at most N cows per phase. Preprocessing and simulation take O(L(N+251)) time and O(LN) table space. Phase zero represents the first input day, while reported elimination dates start at one.
