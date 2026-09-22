# Optimize line breaks after deriving each line's best gap distribution

## Problem and constraints

Reformat each paragraph to width `W <= 80` without changing words or order. Every line, including the last, is fully justified and must begin and end with a word. A gap of `s` spaces costs `(s-1)^2`. A one-word line is left-aligned without trailing padding and costs 500 when shorter than `W`, or zero when exact. Minimize total cost; among ties, compare horizontal gaps in reading order and choose the layout with the smaller first differing gap.

## Building the approach

First fix the consecutive words placed on one line. If their letters total `L` and there are `g` gaps, distribute `W-L` spaces. If two gaps differ by at least two, moving one space from the larger to the smaller reduces their squared cost. Therefore optimal gaps are only `q=floor((W-L)/g)` or `q+1`, with `r=(W-L)%g` longer gaps. Put the longer gaps last so the earliest differing gap is as small as possible. The line cost is `(g-r)(q-1)^2 + r*q^2`. Handle a singleton separately.

Let `cost[i]` be minimum cost for words from index `i` onward. Enumerate every feasible end `j` of the first line and minimize `lineCost(i,j)+cost[j+1]`, computing states backward. Feasibility requires letter count plus at least one space per gap not to exceed `W`.

Equal total costs require comparing the complete gap sequence: this line's gaps followed by the chosen suffix's gaps. Select the candidate with the smaller first difference, not merely the one containing more words on its first line. Store the chosen next index for reconstruction.

## Walkthrough

At width seven, `a bb` contains three letters and one gap, so it prints `a    bb`; the four-space gap costs nine. At width ten, a lone `hi` prints without trailing spaces and costs 500. In the problem example at width 28, moving `are` to the second line reduces total badness from 50 to 12 despite putting fewer words on the first line.

## Why it works

The exchange argument proves that for fixed line words, the `q/q+1` distribution has minimum cost, and placing longer gaps later is tie-optimal. Every legal paragraph layout has one specific first-line endpoint. Replacing its suffix by an optimal suffix cannot increase cost, establishing optimal substructure; backward DP examines all endpoints and obtains the global minimum. Comparing concatenated gap sequences applies the stated first-difference rule across line boundaries, so the chosen representative is also correct among equal-cost layouts. Following stored endpoints reconstructs exactly that solution.

## Complexity

With `N` words and width `W`, feasible-end enumeration costs `O(NW)`. Stored suffix gap sequences use `O(N^2)` bytes; equal-cost comparisons can take up to `O(N^2W)` in the worst case. The implementation is intended for the documented 64 MiB sandbox and measured whole-input bound, rather than being claimed linear-space.

## Common mistakes

- Leaving the final line ragged.
- Padding a singleton or forgetting its 500 penalty.
- Greedily filling each line without considering suffix cost.
- Breaking ties using only the current line.
- Ignoring whitespace during validation and accepting misaligned output.
