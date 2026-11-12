`ArrayDeque<Integer>` serves as the queue: `pollFirst` removes the top card and `addLast` puts a card at the bottom, both in constant time. Input is read line by line with `BufferedReader` and split with `StringTokenizer`, so several numbers on one line are also handled; reading 0 uses the labeled `break outer` to leave both loops at once.

The output starts with `Discarded cards:`. Inside the loop the first card is preceded by a space and later cards by `", "`, controlled by `first`. Each round discards one card and moves the next one to the bottom.

When the loop ends, `peekFirst()` is the remaining card. All output accumulates in a `StringBuilder` and is printed once.
