Mark a team as participating as soon as any submission appears, including R,U,E statuses. Track incorrect attempts and acceptance separately for each team/problem; incorrect submissions to different problems must not mix.

Before acceptance, I increments the wrong-attempt count. Only the first C adds a solved problem and its submission time plus twenty times preceding I attempts. Ignore all later statuses for that accepted problem, including duplicate C. Incorrect attempts on unsolved problems contribute no total penalty.

Process events in received order rather than sorting timestamps: the first accepted event is defined by that order. Then rank participating teams by solved count descending, penalty ascending, and team ID ascending. The platform statement explicitly specifies this ascending-penalty rule.

C/C++ accumulate and compare decimal-string penalties; Java uses BigInteger, avoiding an unstated timestamp limit. Signed comparison checks signs first and reverses magnitude order for negatives; ordinary contest times are nonnegative. Blank lines separate cases and outputs.

With S submissions and T≤100 teams, process each event once and sort in O(T log T), plus digit arithmetic/comparison costs. Team/problem state has only 100×9 entries.
