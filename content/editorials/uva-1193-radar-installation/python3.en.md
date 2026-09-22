Endpoints are represented as `constant + sign*sqrt(square)`. `compare` reduces comparisons of two such values to sign tests and exact integer squaring, taking care not to square expressions before establishing their signs. Python integers prevent intermediate overflow.

Valid intervals sort by exact right endpoints. `position` is updated only when a new radar is placed; `None` avoids collision with real negative coordinates. All islands are parsed into a case before `solve` may return -1, preserving input alignment.
