Think of decompression as maintaining a list of recently used words. A letter starts a literal word; a number selects the kth word in that list. After printing either one, move it to the front. Words are case-sensitive, and punctuation, spaces, and line breaks are copied unchanged.

Moving an entire array for each reference would be slow. Count the E word events first and assign fresh positions from right to left. A smaller position means a more recent word. A Fenwick tree stores 1 at active positions and 0 at removed positions, so selecting the kth active position selects the kth list entry.

`update` changes one position. `kth` skips tree intervals containing fewer words than the remaining rank. A reference removes its old position and inserts the same word at a fresh front position. Only a line containing exactly 0 terminates input. For L input characters and E word events, time is O(L + E log E) and space is O(L + E).
