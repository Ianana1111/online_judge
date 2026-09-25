Sorting adjacent lists would work but spends effort arranging all values merely to cancel common entries. XOR already has the needed cancellation properties: `x^x=0`, `x^0=x`, and order does not matter.

If value `d` is deleted, every other occurrence appears equally often in the two adjacent lists. XORing both complete lists pairs and cancels those occurrences, leaving only `d`. Therefore compute one XOR total per list. After reading the current list, `previous ^ current` is the deleted value; then make the current total the previous total for the next round.

The first list only establishes the initial total and produces no output. Values can be XORed as they are read, so no list storage is required.

XOR cancels values shared by consecutive lists, leaving the missing number.
