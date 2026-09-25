Classify every plan by its last move. If the final move has length one, the preceding moves form any plan to step `k-1`. If it has length two, they form any plan to step `k-2`. The two classes are disjoint and cover all plans, giving

`ways[k] = ways[k-1] + ways[k-2]`.

Set `ways[0]=1` for the empty plan and `ways[1]=1`. The zero-step state is an internal base case that makes `ways[2]=2` naturally; zero need not be a legal input.

Only the previous two states are needed. Roll them through two variables. For `n<=100`, the maximum answer fits the available `unsigned __int128`, then must be converted manually to decimal because standard streams do not directly print that extension type.

Partition paths by whether the last move is one or two steps, leaving n−1 or n−2 steps: a Fibonacci recurrence.
