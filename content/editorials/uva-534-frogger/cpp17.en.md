`best[0]` begins at zero. Each iteration linearly selects the unused vertex with the smallest tentative bottleneck. It is marked used before the target check because selection is the point at which its value becomes final.

The update `min(best[v], max(best[u], dx*dx+dy*dy))` directly expresses choosing among paths and measuring one path's worst jump. All comparisons use squared integers; `sqrtl` is called only for the final three-decimal value. Scenario state increments across cases, while `best` and `used` are recreated, and two newlines preserve case spacing.
