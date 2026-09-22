`cin.get` reads spaces, tabs, and newlines. Only the literal double quote enters replacement logic, selecting from `opening` and then toggling it.

The else branch emits exactly one original character and never modifies state. Since the flag lives outside the read loop, line boundaries and adjacent quotes need no special case, and final newline presence is inherited entirely from input.
