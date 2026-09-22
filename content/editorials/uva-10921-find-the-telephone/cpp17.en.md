The 26 positions of `key` correspond directly to A through Z. Iterating by `char&` allows the code to count an original letter and then replace that same position.

The hyphen branch increments only its count. Zero and one enter no branch, so they remain in the output. Both counters are initialized inside the per-line loop.

The output prints converted text, letter count, and hyphen count separated by single spaces. Token input is safe because valid expressions contain no spaces and continues through EOF, including a lone zero or one.
