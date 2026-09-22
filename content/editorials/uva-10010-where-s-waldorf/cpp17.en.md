`lowercase` converts through `unsigned char` before calling `tolower`, the safe C++ character-function pattern. Grid rows and queries contain no spaces, so formatted extraction also skips blank separator lines correctly.

The nested loops are ordered row, column, row direction, column direction. `found` appears in each loop condition so a complete match stops all further candidates. Bounds are tested before grid access using short-circuit evaluation. Output adds one to both coordinates and places one blank line only between cases.
