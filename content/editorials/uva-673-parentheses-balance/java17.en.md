Push every opening parenthesis or bracket. A closing symbol must match the most recent still-open symbol, the stack top. If the stack is empty or the types differ, the string is invalid; otherwise pop the pair. After scanning, require the stack to be empty so no opener remains unmatched.

Counts alone cannot enforce nesting order. For example, `([)]` has equal counts of both types but closes the outer parenthesis while the bracket is still inside. The LIFO stack records exactly which inner interval must close next. An empty line performs no operations and ends with the initially empty stack, correctly returning `Yes`.

Remember opening brackets; each closing bracket must match the most recent unmatched opener, and the stack must end empty.
