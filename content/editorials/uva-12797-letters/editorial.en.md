# Enumerate letter-case policies, then run ordinary BFS

## Problem and constraints

An `N` by `N` grid, `2<=N<=100`, uses the first ten letters in either case. Move orthogonally from top-left to bottom-right. A valid path may use only uppercase or only lowercase occurrences of each letter, never both. Find the shortest path measured in cells including both endpoints, or -1 if none exists.

## Building the approach

There are `2^10=1024` global policies choosing the allowed case for each letter. Under one policy, every grid cell is simply allowed or blocked, so run ordinary unweighted BFS if both endpoints are allowed. Take the minimum distance across policies.

Letters absent from a path may receive either policy choice, so no third unused state is needed. Start BFS distance at one because cells, not edges, are counted. The universal lower bound is `2N-1`; reaching it permits an early stop.

## Walkthrough

A 2-by-2 grid of lowercase `a` has a three-cell path. If start and finish are `a` and `A`, no policy can allow both. A path containing `a,b,A` also fails despite every adjacent pair differing, because the restriction concerns the complete path history.

## Why it works

Every BFS path under a fixed policy uses at most one case of each letter and is therefore legal. Conversely, any legal path determines one allowed case for every letter it uses; arbitrary choices for absent letters extend this to one enumerated policy, under which the whole path remains available. BFS is no longer than that path. Taking the minimum thus matches the global optimum, and the Manhattan cell-count lower bound justifies early termination.

## Complexity

Each policy explores at most `N^2` cells and four edges per cell, for `O(2^10 N^2)` time and `O(N^2)` reusable space.

## Common mistakes

- Checking case conflicts only between adjacent cells.
- Merging paths with different histories before fixing a policy.
- Starting distance at zero.
- Allowing only right and down movement.
- Requiring every letter to appear on the path.
