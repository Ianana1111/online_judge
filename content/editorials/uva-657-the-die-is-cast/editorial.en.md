# Find each die component, then count its `X` components

## Problem and constraints

In an image from 5 by 5 through 50 by 50, `.` is background, `*` is die surface, and `X` is a pip pixel. Each maximal four-neighbor component of nonbackground pixels is one die; each maximal four-neighbor component of `X` inside it is one pip. Diagonal contact does not connect. Output every die's pip count in increasing order, preserving duplicate counts.

## Building the approach

The image has two different connectivity meanings. First, BFS through any pixel other than `.` to collect all cells of one die, marking them in `dieSeen`. Then inspect those cells. Whenever an `X` has not yet been processed in `pipSeen`, increment the die's count and run a second BFS restricted to `X`, marking the entire pip component.

The two visited tables must remain separate: die discovery needs to pass through both `*` and `X`, while pip discovery may pass only through `X`. The original grid can remain unchanged. Store one result per die in a vector and sort it; a set would wrongly remove equal results from distinct dice.

## Walkthrough

A connected 25-pixel patch of `X` is one pip and may itself form an entire die. Two `X` patches separated by `*` belong to the same die but count as two pips. Dice touching only at corners remain separate, and pips touching only diagonally remain separate as well.

## Why it works

The first BFS started at an unvisited nonbackground pixel returns exactly its maximal four-neighbor nonbackground component, so every die is found once and completely. Within those cells, each second BFS returns exactly one maximal `X` component and increments once. An `X` component cannot cross between different dice because `X` connectivity implies nonbackground connectivity, so a global pip visited table is safe. Sorting then produces the required multiset order.

## Complexity

Every pixel is visited at most once by die BFS and every `X` pixel once more by pip BFS, giving `O(WH)` traversal time plus `O(D log D)` for `D` dice. Grid, visited tables, and queues use `O(WH)` space.

## Common mistakes

- Counting `X` pixels rather than connected pip components.
- Using eight-neighbor connectivity.
- Letting die discovery walk only through `*` and treating `X` as gaps.
- Sharing one visited table for both connectivity meanings.
- Using a set and dropping distinct dice with equal pip counts.
