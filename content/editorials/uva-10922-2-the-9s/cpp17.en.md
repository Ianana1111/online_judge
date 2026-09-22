`digitSum` traverses a decimal string and accumulates `ch-'0'`. The loop terminates only when the entire input token equals `"0"`, so other zero digits remain valid data.

The first total supports the modulo-nine decision. The failure branch performs no degree loop. The success branch initializes degree to one, converts only the small total to a short string for reuse of the same helper, and repeats until nine.

The original `number` is never modified, so even a thousand-digit input is reproduced exactly in the required sentence.
