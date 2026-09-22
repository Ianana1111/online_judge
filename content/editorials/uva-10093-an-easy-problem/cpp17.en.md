`digitValue` handles numeric, uppercase, and lowercase ranges with offsets 0, 10, and 36. The main scan skips either sign and computes digit sum and maximum together.

Candidate bases begin at both legality bounds, so `base-1` is never zero. Integer remainder tests exact divisibility. The first match records and exits, while `-1` after base 62 selects the exact impossible sentence. Zero and signed zero follow normal processing; only EOF ends input.
