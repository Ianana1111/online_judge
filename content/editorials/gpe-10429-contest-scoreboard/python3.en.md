`rank` owns all scoring state for one contest. Each `teams[team]` entry holds solved count, total penalty, a ten-element wrong-attempt array, and a ten-element solved array. Index zero in the arrays is unused, so problem numbers can index them directly.

After creating the team, the solved-flag check ignores every later record for an accepted problem. The I branch only increments its counter. The C branch sets the flag and transfers the submission time plus `20 * wrong_count` into the total. Other verdicts need no update.

The sorting key `(-solved, penalty, team)` uses ordinary ascending tuple order to express all three ranking rules. `main` separates cases by blank lines and joins the resulting scoreboards with one blank line between them. Python integers keep submission times and accumulated penalties exact without a fixed-width assumption.
