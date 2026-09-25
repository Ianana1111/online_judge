The answer is a union of dates, not a sum of party strike counts. Create a boolean array `stopped`. For every party period `h`, mark `h,2h,3h,...` through `N`. Multiple parties writing true to one day still leave one boolean event.

After all marking, scan days one through N once. With Sunday at day one, day six is Friday and day seven is Saturday, so residues 6 and 0 modulo seven are excluded. Count a day only when it is marked and has neither weekend residue.

A period longer than the simulation simply marks nothing and needs no special handling.

Mark strike days once to avoid duplicates, then exclude Fridays and Saturdays when counting.
