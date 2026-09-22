Fenwick entries are zero-or-one occupancy, while `position` maps movie IDs to current indices. All initial positions exceed the m reserved front positions.

Each request queries and prints before mutation, subtracts the old cell, assigns `top`, and adds the new cell. Starting `top=m` and decrementing after use means the final request uses index one, never zero. Output spacing is controlled by the request index so each case occupies one clean line.
