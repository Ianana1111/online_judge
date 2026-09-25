Before trying to optimize an entire interval, solve a smaller task: can you count the sequence for one starting number? Follow the rule until reaching one and count the visited values. Once that works, try every start between the smaller and larger endpoint and keep the maximum. Looking only at the endpoints is not enough.

Now ask where work is repeated. Ten goes to five, and five goes to sixteen. If we already know the length starting at five, the length starting at ten is exactly one more. That observation gives us memoization; it is not necessary to find a closed formula for the sequence.

Set `memo[1] = 1`. For a new start, collect the unknown part of its path until reaching a cached value. Walk backward through that path, adding one at each step. Cache only values at most one million to keep memory bounded. Larger intermediate values are still processed; they are simply not used as array indices.

Memoize cycle lengths, fill the traversed path backward on reaching a cached value, and preserve the original endpoint order in output.
