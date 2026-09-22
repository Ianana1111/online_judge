The `fingers` map stores the literal finger numbers from the statement. Character `'0'` denotes finger ten and maps to array index nine; characters `'1'` through `'9'` map by subtracting `'1'`.

After reading the test count, one `getline` consumes its remaining newline. Every later `getline` corresponds to one complete song, including an empty one. A trailing carriage return is removed only for CRLF normalization.

Fresh counter and previous-state arrays are created for every song, and a fresh current-state array for every note. After counting transitions, assigning `previous=current` records releases as well as presses. Output visits the ten indices in finger order with exactly one separating space.
