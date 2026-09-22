Formatted extraction with `cin >> text` skips the blank separator lines, which is correct because valid strings contain no spaces. `answer` begins at `n`, the guaranteed one-copy period.

Each candidate first passes the divisibility test. Comparisons begin at index `k`, since the first template copy trivially equals itself, and `text[i % k]` selects the expected character. Breaking on the first successful candidate preserves minimality. A blank line is printed before every result after the first, giving exactly one separator and none before the first case.
