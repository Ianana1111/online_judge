This is a transition-count problem rather than a note-frequency problem. Encode the statement's fingering table directly. Maintain a ten-entry Boolean array `previous` for the preceding note. For each current note, build another Boolean array from its table entry.

For finger `i`, increment its counter exactly when `current[i]` is true and `previous[i]` is false. Then replace `previous` with `current`; this update represents both fingers newly pressed and fingers released for the next note.

Read each song as a complete line. Token extraction would skip an empty song and shift every later test case.

Each note has a set of pressed fingers; count a finger only when it changes from unpressed to pressed.
