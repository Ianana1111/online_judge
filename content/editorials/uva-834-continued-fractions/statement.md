Let b<sub>0</sub>, b<sub>1</sub>, b<sub>2</sub>, . . . , b<sub>n</sub> be integers with b<sub>k</sub> \> 0 for k \> 0. The continued fraction of order n with coeficients
b<sub>1</sub>, b<sub>2</sub>, . . . , b<sub>n</sub> and the initial term b<sub>0</sub> is defined by the following expression

<div class="oj-center">b<sub>0</sub> + 1 / (b<sub>1</sub> + 1 / (b<sub>2</sub> + ... + 1 / b<sub>n</sub>))</div>

which can be abbreviated as [b<sub>0</sub>; b<sub>1</sub>, . . . , b<sub>n</sub>].

An example of a continued fraction of order n = 3 is [2; 3, 1, 4]. This is equivalent to

<div class="oj-center">2 + 1 / (3 + 1 / (1 + 1 / 4)) = 43/19</div>

Write a program that determines the expansion of a given rational number as a continued fraction.
To ensure uniqueness, make b<sub>n</sub> \> 1.

### Input

The input consists of an undetermined number of rational numbers. Each rational number is defined
by two integers, numerator and denominator.

### Output

For each rational number given in the input, you should output the corresponding continued fraction.

### LOCAL platform clarification

The denominator is nonzero. Normalize its sign and use floor quotients, allowing a negative first coefficient. For an integral rational, print `[b0;]` (including the semicolon); the final-coefficient-greater-than-one condition applies only when a fractional tail exists.
