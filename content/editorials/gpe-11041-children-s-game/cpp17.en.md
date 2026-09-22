The vector stores decimal strings directly, preserving every input occurrence. The sorting lambda constructs `a + b` and `b + a` and returns true only when the first is strictly larger.

No separate special handling is needed when the two concatenations are equal: the comparator returns false in both directions, and either order is optimal. Keeping duplicates in a vector ensures all required numbers still appear.

The final loop prints the strings without spaces or intermediate numeric conversion, followed by one newline. The outer loop reads a new count and stops at zero before allocating another case.
