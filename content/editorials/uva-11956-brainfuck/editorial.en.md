# Simulate circular pointer and byte state independently

## Problem and constraints

Simulate a Brainfuck subset on 100 zero-initialized cells with pointer at cell zero. `>` and `<` move circularly; `+` and `-` change the current byte modulo 256; `.` does not change state. Programs contain no loops. Finally print all 100 cells as two-digit uppercase hexadecimal values.

## Building the approach

Store a 100-element integer array and one pointer. Move right with `(pointer+1)%100` and left with `(pointer+99)%100`. Increment a cell with `(value+1)%256` and decrement with `(value+255)%256`. Adding the period before modulo avoids negative C++ remainder.

The requested output is only the final memory dump. A dot is an original-language output command but does not alter state and must not emit extra intermediate text here.

## Walkthrough

Program `<-` moves from cell 0 to cell 99, then wraps byte zero down to 255, so only the last cell prints `FF`. Exactly 256 plus commands wrap cell zero back to `00`. A dot does not change either outcome, and even an unchanged program prints all 100 zero cells.

## Why it works

Initially the stored machine matches the specification. Each recognized state-changing command performs the exact circular transition for its own modulus, and dot preserves state. Induction over program characters proves the final pointer and memory match the machine. Printing cells in physical index order then gives the required snapshot.

## Complexity

For program length `L`, time is `O(L+100)` and working memory is the fixed 100-cell array plus the input line.

## Common mistakes

- Failing to wrap pointer -1 to 99 or byte -1 to 255.
- Confusing pointer modulus 100 with byte modulus 256.
- Clamping instead of wrapping.
- Printing intermediate data for `.`.
- Omitting zero padding, using lowercase hex, or skipping untouched cells.
- Leaving hexadecimal formatting active for the next case number.
