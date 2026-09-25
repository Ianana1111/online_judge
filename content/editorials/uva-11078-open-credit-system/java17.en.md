Start by fixing the later student `j`. Among all valid earlier students, the best partner is simply the one with the largest score. This means the entire prefix before `j` can be summarized by one number: its maximum score.

Read the first score into `highest`. For each later `current` score, first consider `highest - current` as a candidate answer. Only after that should `current` be added to the prefix by updating `highest`. The order of these two operations preserves the strict condition `i < j`; reversing them could compare a student with themself.

Initialize the answer to a very small value rather than zero. Zero would incorrectly allow choosing no pair when all legal differences are negative.

`highest` contains only earlier students, preserving the required direction of every difference.
