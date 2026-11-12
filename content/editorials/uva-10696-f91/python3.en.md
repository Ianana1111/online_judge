`sys.stdin.buffer.read().split()` splits the entire input into tokens at once, which works whether numbers are separated by newlines or spaces and is much faster than calling `input()` per line. When the token is 0 the loop breaks, so the terminator produces no output.

Each n follows the derived rule: 91 when it is at most 100, otherwise n − 10. Python integers cannot overflow, so a plain comparison is enough.

All lines are collected in the list `out` and written once through `"\n".join`. Calling `print` 250,000 times would spend noticeable time on call overhead and buffering; a single write avoids that. A trailing newline is added only when there is output, so an input that starts with 0 prints nothing.
