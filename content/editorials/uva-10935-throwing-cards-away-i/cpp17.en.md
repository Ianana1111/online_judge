`queue<int> deck` receives 1 through n in order, so its front is the top of the deck. The first output line is built in the string `line`, starting with the fixed `Discarded cards:` and no space after the colon. When n = 1 and nothing is discarded, that is exactly the whole line.

Each round of `while (deck.size() >= 2)` first chooses a separator: a single space before the first card and `", "` before every later card, controlled by the `first` flag. The front card is appended to the string and popped, then the new front is copied to the back and popped, which moves it to the bottom.

When the loop ends one card is left, and `deck.front()` is the remaining card. Both lines are printed with their own newline, with no trailing space or comma.
