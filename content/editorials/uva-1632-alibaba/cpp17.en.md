`arrive` rejects impossible -1 input, computes a widened candidate, and uses strict deadline comparison before narrowing. `earliest` combines candidates while treating -1 as absence rather than a better time.

For a fixed length, index l still represents old interval `[l,r-1]`, while l+1 represents `[l+1,r]`. Both next values are computed before overwriting l, and increasing l leaves future l+1 entries untouched. All valid singletons start at zero, and full interval index zero contains the final endpoint states.
