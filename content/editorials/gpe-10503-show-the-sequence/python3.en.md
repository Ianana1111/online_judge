`evaluate` follows the single chain of nested brackets. `at` advances past each opening bracket, reads an optional minus sign and digits, and either recognizes the innermost constant or appends `(value, operator)` to `frames`. Since the grammar is valid and has only one child per layer, the trailing closing brackets need no separate evaluation work.

`reversed(frames)` processes parents only after their child list is ready. In the `+` branch, `output` starts with `value`, and `result[:-1]` supplies the N − 1 increments. In the multiplication branch, `output` starts empty, and each child item is multiplied into `current` before appending it.

Assigning `result = output` completes a layer without modifying values still being read. Python's integers preserve signs and large exact values, and the final join prints exactly N space-separated terms.
