# Separate command parsing from terminal state updates

## Problem and constraints

Simulate a 10-by-10 text terminal. The screen starts blank, the cursor starts at the upper-left corner, and overwrite mode is active. Ordinary characters are written at the cursor; commands beginning with `^` move the cursor, clear text, change the writing mode, or produce a literal caret. Input line breaks are ignored, while spaces inside lines are printable.

## Building the approach

Keep three independent pieces of state: ten fixed-width strings for the screen, `(row, col)` for the cursor, and a boolean for insert mode. Scan each data line by index. An ordinary character goes to one shared writing routine. On `^`, consume the command character and, for a coordinate command, the following digit as well.

Most commands update state and produce no character. The exception is `^^`: turn it into one literal `^` and pass it through the ordinary writing routine, so insert mode and cursor movement still apply.

In overwrite mode, replace the current cell. In insert mode, shift cells from column 8 down to the cursor toward the right, working backward so no source is overwritten before it is copied; the old last character is discarded. Then write the new character and move the cursor right unless it is already at column 9. Movement commands are clamped at screen boundaries. Clearing the screen preserves the cursor and mode, while erase-to-end includes the current cell.

## Walkthrough

If the first row contains `0123456789`, returning to its start, enabling insert mode, and typing `ABC` produces `ABC0123456`. Typing repeatedly at column 9 keeps changing that last cell rather than wrapping. In `^55abc^cX`, clearing removes the text but leaves the cursor after `abc`, so `X` is written at row 5, column 8.

## Why it works

Initially all stored state matches the terminal definition. Every control token changes exactly the components named by that command. For an ordinary character, overwrite mode performs the required replacement; insert mode's backward copies preserve every old suffix character until it reaches its new position, and discards only the final cell. Both paths then apply the specified cursor rule. By induction over parsed tokens, the simulated screen, cursor, and mode equal the real terminal after every prefix, so the framed final screen is correct.

## Complexity

Each input character is parsed once. An insertion moves at most nine cells and a clear touches exactly 100, all constants, so total time is `O(L)` for `L` input characters. The screen uses constant `O(1)` space apart from the current input line.

## Common mistakes

- Resetting the cursor or mode when the screen is cleared.
- Shifting an inserted suffix from left to right and overwriting source cells.
- Wrapping to another row after column 9.
- Treating input newlines as terminal movement or skipping printable spaces.
- Writing `^^` without applying the active insert mode and cursor rule.
