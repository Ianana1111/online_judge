# Stream a thousand-digit number through its remainder modulo eleven

## Problem and constraints

Each line is a positive decimal integer of up to 1000 digits. Determine whether it is divisible by eleven, echoing the original number in the required sentence. The literal `0` terminates input and is not processed.

## Building the approach

Keep only the remainder of the prefix read so far. Appending digit `d` changes prefix value from `v` to `10v+d`, so update

`remainder=(remainder*10+d)%11`.

The remainder always stays from zero through ten, regardless of input length. After every digit, a zero remainder is equivalent to divisibility. Preserve the original string for output instead of converting it to a fixed-width number.

The alternating-digit-sum rule for eleven is another valid derivation, but streaming remainder generalizes directly and avoids sign handling.

## Walkthrough

For 121, successive remainders are one, one, and zero, so it is a multiple of eleven. For 123, the final remainder is two.

A thousand-digit value simply performs the same constant-size update one thousand times.

## Why it works

Inductively, let `remainder` equal the already read prefix modulo eleven. The next decimal prefix is `10*prefix+d`; modular arithmetic preserves multiplication and addition, so the update computes its exact remainder. The empty prefix starts at zero, establishing the invariant.

After the final character, the maintained value is the complete number modulo eleven. It is zero exactly for multiples of eleven.

## Complexity

For L digits, time is `O(L)`, working remainder space is `O(1)`, and preserving the output string uses `O(L)`.

## Common mistakes

- Parsing the thousand-digit value into `long long`.
- Using ordinary digit sum, which is a rule for three or nine.
- Printing the terminating zero.
- Omitting the original number or fixed sentence.
- Stopping when an intermediate prefix happens to have remainder zero.
