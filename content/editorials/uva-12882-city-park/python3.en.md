Touching rectangular stones belong to the same park. Comparing every pair takes O(n²), too much for 50000 stones. Since interiors do not overlap, contact must occur on boundaries, and corner contact also counts.

Represent each rectangle by two vertical and two horizontal sides. A side stores its supporting line, interval start/end, and stone ID. Sort first by line, then by start. On the same line, an interval starting no later than the current farthest end joins the current contact group.

Keep representative as the stone whose side reaches the farthest end. If a new interval extends farther, update both end and representative; otherwise still join it because it already touches the group. Use <= rather than < to include corner contact. Start a new group only at a different line or a gap.

A disjoint-set union tracks stone components and sums their areas on each merge. After the vertical and horizontal sweeps, the largest component area is the answer. Merge areas only when roots differ, so multiple contacts do not double-count stones.

Sorting four sides per stone takes O(n log n) time and O(n) space. C/Java use 64-bit coordinates and areas for safe intermediate arithmetic. Python reads numeric tokens in bounded chunks rather than retaining the entire input alongside all side records.
