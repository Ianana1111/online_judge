Both inputs are declared as `long long`, so extraction and subtraction already use a sufficiently wide integer type. The `while (cin >> a >> b)` condition reads complete pairs until EOF and does not give any numeric value a special meaning.

`max(a, b) - min(a, b)` encodes the required nonnegative difference explicitly. It also avoids relying on a particular `abs` overload or on an assumed ordering of the two inputs. Each iteration prints one result followed by a newline. Nothing needs to persist between pairs, so the implementation keeps only the two input variables.
