`best` is initialized to `-1`, which separates unreachable times from the reachable empty plan at time zero. A transition is applied only when its source is nonnegative, so an impossible duration can never create a false answer.

The loop processes time in increasing order. Reading an earlier state after it has already been finalized permits unlimited copies of either burger, as required. The final downward scan must stop because `best[0]` is zero. The second output field is emitted only when `used < t`, and its value is the actual unused duration `t-used`.
