The first `getline` after reading the count consumes only that count line's remainder. Every subsequent `getline` is one case, including an empty one. A trailing carriage return from CRLF is removed so it is not mistaken for a bracket.

For a closing symbol, `expected` is its required opener. The condition checks `stack.empty()` first, relying on short-circuiting before `back()`. A mismatch sets `valid` false; final output still requires both `valid` and an empty stack, covering wrong closers and unclosed openers.
