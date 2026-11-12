# Pair the sorted counts into tiers from the outside in, then take the smallest letter per slot

## Problem and constraints

There are N pigeonholes in a row (1 < N < 26), and the workers are the first N capital letters. The input is a string of letters ending with `#`; each occurrence is one parcel for that worker, and characters that are not among the first N letters are ignored. Every worker gets one pigeonhole so that heavier mail sits farther from the middle (N + 1)/2: if pigeonhole i is farther from the middle than pigeonhole j, it must hold at least as many parcels. Among valid arrangements, print the lexicographically smallest sequence of workers from pigeonhole 1 to N, then the parcel counts on a second line.

## Building the approach

Ignore the letters for a moment and look only at the counts. Group the pigeonholes into tiers by distance from the middle: the outermost tier is pigeonholes 1 and N, the next tier is 2 and N − 1, and so on; when N is odd the middle pigeonhole is a tier of its own. Outer tiers must hold counts no smaller than inner tiers, so after sorting the counts in decreasing order the two largest go to the outermost tier, the next two to the next tier, and the smallest one (for odd N) to the middle. The pair of counts for each tier is forced; only the letters are a choice.

Now handle the lexicographic order. Comparison starts at pigeonhole 1, so pigeonholes 1, 2, … should each get the smallest letter possible. Left pigeonhole k belongs to tier k with counts a and b: pick the smallest unused letter whose count is a or b. If it has count a, the right pigeonhole of the same tier must later get count b, and vice versa, so record that requirement.

After the left half, the middle pigeonhole takes the smallest letter with the smallest count. The right half is filled from the middle outward, each slot taking the smallest unused letter with the recorded count.

Choosing the smallest letter at each step never blocks later steps, because letters with the same count are interchangeable: as long as the number of letters with each count equals the number of slots needing that count, any choice can be completed. So greedily minimizing earlier pigeonholes gives the lexicographically smallest arrangement overall.

## Walkthrough

In the first sample N = 5. Ignoring V, A has 3 parcels, B 8, C 11, D 9 and E 4. Sorted counts are 11, 9, 8, 4, 3: the outer tier is {11, 9}, the second tier {8, 4}, and the middle gets 3.

Pigeonhole 1 can take a letter with 11 or 9, that is C or D, so it takes C and pigeonhole 5 must get 9. Pigeonhole 2 can take 8 or 4, that is B or E, so it takes B and pigeonhole 4 must get 4. The middle takes A with 3. Pigeonhole 4 gets E (4) and pigeonhole 5 gets D (9). The result is `C B A E D` with counts `11 8 3 4 9`, matching the sample.

## Why it works

First, the count layout is forced. If some tier held a count smaller than a count in a more inner tier, the "farther means heavier" rule would be broken, so after sorting, each tier's multiset of counts must be two consecutive sorted values.

Next, the letters. With the count layout fixed, a partial arrangement can be completed exactly when, for every count, the remaining letters with that count equal the remaining slots requiring it. Each step picks a letter whose count is allowed for that slot, so this balance is preserved and every choice remains completable. Lexicographic comparison starts at pigeonhole 1, and every pigeonhole received the smallest completable letter, so any other valid arrangement places a larger letter at its first difference. Hence the result is lexicographically smallest.

## Complexity

Counting parcels is O(L) for a string of length L, sorting is O(N log N), and each slot scans at most N letters, O(N²) in total. With N < 26 this is tiny.

## Common mistakes

- Counting letters beyond the N-th worker as parcels.
- Forgetting that workers with no mail still need a pigeonhole, with count 0.
- Always putting the heavier count on the left without comparing letters, which is not lexicographically smallest.
- Filling the right half in the same order as the left instead of mirroring it from the middle outward.
- Assuming a single middle pigeonhole when N is even.
