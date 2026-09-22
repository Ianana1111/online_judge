`getline` defines one independent result, and `inside` plus `words` are recreated for each line. The letter test uses explicit ASCII ranges, avoiding locale-dependent classifications.

At the end of every character iteration, `inside` becomes the current `letter` value. Commas, hyphens, digits, and spaces therefore all reset it, allowing the next letter to begin a new run. Since counting happens at word entry, no special end-of-line action is necessary.
