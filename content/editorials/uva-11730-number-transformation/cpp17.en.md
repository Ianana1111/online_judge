`remaining` shrinks during factorization while `value` keeps the original state for the proper-factor check. Dividing out all powers records each prime factor once and avoids duplicate next states.

The distance array covers the larger of start and target, so `S>T` is still safely initialized. Transitions above target are skipped. Setting the start distance to zero handles equality automatically, and the double-zero sentinel does not receive a case number.
