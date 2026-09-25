Store all ten records while maintaining `best`, the maximum score seen. After all input is known, scan the stored vector in original order and print every record with `score==best`.

This two-pass structure avoids printing a temporary maximum before a later higher score appears. Sorting or mapping by score could disturb ordering or discard duplicate records.

Parallel arrays associate each URL with its score, then a second pass outputs all maxima.
