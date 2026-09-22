After reading the appointment count, one `getline` consumes its newline. Each appointment line is then read whole; a string stream extracts only the first two time tokens while leaving arbitrary description text harmless. Fixed `hh:mm` text converts directly to integer minutes.

The 18:00 sentinel enters the same sorted scan. Negative gaps from overlap cannot replace the best. `cursor=max(cursor,end)` preserves interval union. Start hours and minutes use two-digit zero padding; duration values do not, and any duration of at least sixty minutes enters the hours wording branch.
