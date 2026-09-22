The `flush` lambda inserts only a nonempty buffer and always clears it, so every delimiter uses the same safe behavior. `cin.get` reads spaces and newlines instead of skipping them.

Case conversion and letter tests are explicit ASCII comparisons, avoiding locale and signed-character classification differences. EOF is followed by one final `flush` to preserve an unterminated last word.

The `set` traversal is already lowercase, deduplicated, and lexicographically ordered, requiring no separate sort.
