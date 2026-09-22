The coefficient list is ordered from constant to highest degree. For each old coefficient, `updated[degree]` receives its `-root` contribution and `updated[degree+1]` receives its `x` contribution. Only after all old terms are processed does the new list replace the old one.

Formatting traverses degrees in reverse. A zero is skipped only when its degree is positive, preserving the required constant zero. The term body contains the absolute coefficient and variable portion; separators supply the sign according to whether the term is first and whether its coefficient is negative.

The leading coefficient is always positive one, so the first emitted term is well-defined. Python's exact integers avoid depending on fixed-width overflow, and the final suffix ` = 0` is appended once after every term has been formatted.
