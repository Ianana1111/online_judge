Each weighing's `side` row begins at zero, then marks left entries `+1` and right entries `-1`. `result` uses the same left-minus-right sign convention, so multiplying placement by light/heavy direction replaces several special cases.

`possibilities` resets for every coin and counts its surviving directions only. `candidates` increases once when that count is positive, preventing a single id with two possible signs from being counted twice. `answer` is printed only when exactly one id survives; both zero and multiple candidates print zero. A blank line separates datasets.
