The outer loop reads a query count and stops before trying to read a center for the zero sentinel. Every residence is compared directly with the current `centerX` and `centerY`.

The border branch uses logical OR and prints immediately. In the other branch, the first conditional emits north or south and the second east or west, preserving the required letter order and Portuguese west abbreviation.
