`value` evaluates an element without building an array. It widens to `__int128` before multiplication, preventing intermediate overflow, then returns the value as `long long` under the problem guarantee.

`takeA` and `takeB` are counts, so the last selected indices are one smaller while the first unselected indices equal the counts. `LLONG_MIN` and `LLONG_MAX` model empty boundaries. If A's left value crosses B's right value the search moves left; the symmetric violation moves right. With `rank=n`, the maximum left boundary is exactly the requested one-based N-th value.
