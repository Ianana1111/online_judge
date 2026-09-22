# Keep the best earlier score for an order-sensitive difference

## Problem and constraints

The scores are listed from more senior to less senior students. We need the maximum value of `score[i] - score[j]` over pairs with the strict order `i < j`. This is not an absolute difference, and choosing the same student twice is forbidden. A test can contain up to 100,000 scores, so checking every pair is too slow. The answer may also be negative when every later student has a higher score.

## Building the approach

Start by fixing the later student `j`. Among all valid earlier students, the best partner is simply the one with the largest score. This means the entire prefix before `j` can be summarized by one number: its maximum score.

Read the first score into `highest`. For each later `current` score, first consider `highest - current` as a candidate answer. Only after that should `current` be added to the prefix by updating `highest`. The order of these two operations preserves the strict condition `i < j`; reversing them could compare a student with themself.

Initialize the answer to a very small value rather than zero. Zero would incorrectly allow choosing no pair when all legal differences are negative.

## Walkthrough

For scores `80, 70, 90, 60`, begin with `highest = 80`. The candidates are `10`, then `80 - 90 = -10` before `highest` becomes `90`, and finally `90 - 60 = 30`. The answer is 30.

For `1, 5, 9`, all legal differences are negative: `-4`, `-8`, and `-4`. The correct maximum is `-4`, which is why an initial answer of zero would be wrong.

## Why it works

Before processing position `j`, `highest` is exactly the maximum score among positions `0` through `j - 1`. Therefore `highest - score[j]` is the largest difference among all legal pairs ending at `j`. Every legal pair has some later endpoint `j`, so taking the maximum of these candidates considers every possible pair. Updating `highest` afterward restores the invariant for the next position without ever allowing `i = j`.

## Complexity

Each score is processed once, so the time complexity is `O(n)`. Only `highest` and the current answer are stored, giving `O(1)` extra space.

## Common mistakes

- Taking an absolute difference and losing the senior-to-junior direction.
- Subtracting the global minimum from the global maximum without respecting their order.
- Initializing the answer to zero even though every valid result may be negative.
- Updating `highest` before forming the candidate, which permits comparing a score with itself.
