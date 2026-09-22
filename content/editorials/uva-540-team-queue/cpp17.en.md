`owner` maps an id directly to its team. Every member legal in the current scenario is rewritten while reading definitions, so clearing the entire million-entry array is unnecessary. The per-team deques and `active` queue are recreated for each scenario.

An ENQUEUE adds a team id to `active` only when its member deque was empty, ensuring one block per active team. DEQUEUE prints and removes the front teammate, then removes the team id exactly when that block empties. The scenario header and trailing blank line are printed even if no departure occurs.
