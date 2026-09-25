Use a 10×10 `char` screen and store cursor position and insert mode separately. `BufferedReader` preserves spaces within each data line while its newline is ignored. When scanning `^`, consume the next command and one more digit for a coordinate command.

Control commands do not write characters except `^^`, which follows the ordinary write path. In insert mode, shift the current row's suffix rightward in descending column order; in overwrite mode, replace the current cell. Advance the cursor but clamp it to the right edge. Screen clearing changes cells without resetting the cursor.
