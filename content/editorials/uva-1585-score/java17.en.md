An O is worth its position in the current run of consecutive O answers, not a fixed one point. Scan from left to right with a streak counter. On O, increment streak and add it to the total; on X, reset streak so the next run starts at one. Reinitialize both streak and total for every test case, or results would leak between cases. Each character is examined once, giving linear time in the answer length.

`charAt` visits each answer character, and `StringBuilder` collects case outputs.
