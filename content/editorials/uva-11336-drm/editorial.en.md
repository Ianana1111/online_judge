# Contract only new-place components to validate a detailed road map

## Problem and constraints

Two undirected maps are given. The second is a more detailed version of the first only if every old place still exists and every old street's endpoints are connected in the new map by a path whose internal vertices are all newly added places. Passing through another old place is forbidden. Each map ends with three asterisks, and all input ends with `END`. Place names are case-sensitive.

## Building the approach

Ordinary connectivity loses the crucial restriction on internal vertices. First collect the old-place set and reject the case if any old place is absent from the new map. Assign IDs only to new places and union only new-new streets. Each resulting component is a region through which a legal replacement path may travel freely.

For every old place, record the new-place components directly attached to it. Separately record new-map streets that directly join two old places. An old street `a-b` is valid exactly when the same direct street remains, or both endpoints attach to one common new component. Intersect their sorted component-ID sets to test the second condition.

Old places must never enter the DSU, or a path through a third old city would be accepted. A self-loop needs no internal path; after confirming the old vertex still exists, its zero-length connection is valid.

## Walkthrough

Suppose the old map has `a-b` and `b-c`, while the new map contains only `a-c` and `c-b`. The new map is connected, but replacing old street `a-b` requires passing through old place `c`, so the answer is `NO`.

If the new map instead has `a-x`, `b-x`, and `c-x`, with new place `x`, both old streets may legally use `x` as an internal point and the answer is `YES`.

## Why it works

A retained direct street is immediately a valid replacement. Otherwise, any legal replacement path has at least one internal vertex, all of which are new places. Those internal vertices form a connected sequence inside one new-only DSU component, so both old endpoints must attach to that component. This proves necessity.

Conversely, if both endpoints attach to the same new-only component, component connectivity supplies a path between their attachment vertices, and adding the two endpoint edges creates a path whose internal vertices are all new. Thus the test is sufficient. Checking every old vertex and every old street covers both requirements of a detailed map.

## Complexity

Let `V` and `E` describe the combined maps. Building name maps and sets costs `O((V+E) log V)`, and DSU work is nearly linear. Set intersections may total `O(EV)` in the worst case. Storage is `O(V+E)`.

## Common mistakes

- Checking only ordinary connectivity and allowing another old place as an internal vertex.
- Checking old streets but forgetting that every old place must remain.
- Accepting when only one endpoint attaches to a new component.
- Treating undirected edges as ordered pairs.
- Reversing the old and new map names in the output sentence.
