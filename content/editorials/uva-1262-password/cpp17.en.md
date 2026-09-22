The two boolean arrays deduplicate each grid column. Scanning letter indices from zero through 25 both intersects and sorts the choices. `suffix[5]=1` represents the one empty suffix and seeds all block sizes.

If the total is zero, positive `k` triggers `NO` before any division. Otherwise every block is positive and `rank/block` is a valid character index. Using `k>total` retains the last valid rank, and five quotient/remainder steps construct the answer.
