Separate the required full turns first: two clockwise turns and one counterclockwise turn always contribute `3 * 40 = 120` ticks. Then measure the three directed partial turns. Clockwise decreases the dial number and counterclockwise increases it, giving `(start-a+40)%40`, `(b-a+40)%40`, and `(b-c+40)%40`. Add the ticks and multiply by nine degrees per tick. The added 40 also keeps remainders nonnegative in C and Java. Only four zeros together terminate input.

The Java version reads tokens with `Scanner`, uses an integer type wide enough for the bounds, and obeys the specified terminator.
