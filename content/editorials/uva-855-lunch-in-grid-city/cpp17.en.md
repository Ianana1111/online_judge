`streets` and `avenues` store all coordinates independently, including duplicates. Sorting them separately intentionally discards original friend pairings because Manhattan cost separates by axis.

Index `(f-1)/2` selects the center for odd `f` and the lower of two centers for even `f`. The fixed output then uses the street median and avenue median in their correct labeled positions. Fresh vectors per case prevent prior coordinates from persisting.
