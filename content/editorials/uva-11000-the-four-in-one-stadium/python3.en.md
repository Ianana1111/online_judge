Let `male` and `female` describe one completed year, with the immortal queen included in female. Every current bee produces a next-generation male, so

`nextMale=male+female`.

Only current males produce new ordinary females, and the queen remains, so

`nextFemale=male+1`.

Compute both next values from the unchanged old state before assigning them. Begin with `(0,1)` and repeat N times. The second output is `male+female`, not the female count alone.

Year zero has no males and one female; the second output field is the combined population.
