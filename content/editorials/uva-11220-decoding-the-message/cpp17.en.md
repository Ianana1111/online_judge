`getline` preserves message-line and blank-line boundaries, while `istringstream` handles any amount of whitespace inside a line. `decoded` is local to the current line, so the desired index resets automatically.

The condition `word.size() > decoded.size()` is checked before indexing and prevents an out-of-range access. A valid nonempty encoded line always yields at least its first letter, so an empty decoded result identifies a separator. `started` skips leading blank lines but ends a case after its content has begun.
