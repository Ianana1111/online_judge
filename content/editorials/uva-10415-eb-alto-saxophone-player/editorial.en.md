# Count transitions from released to pressed for each finger

## Problem and constraints

Every note uses a fixed subset of ten fingers. Count a press only when a finger changes from released on the previous note to pressed on the current note. A finger held across consecutive notes is not pressed again. There can be up to 1000 songs of at most 200 notes, including an empty song. Uppercase and lowercase notes have distinct fingerings, and all fingers begin released for each song.

## Building the approach

This is a transition-count problem rather than a note-frequency problem. Encode the statement's fingering table directly. Maintain a ten-entry Boolean array `previous` for the preceding note. For each current note, build another Boolean array from its table entry.

For finger `i`, increment its counter exactly when `current[i]` is true and `previous[i]` is false. Then replace `previous` with `current`; this update represents both fingers newly pressed and fingers released for the next note.

Read each song as a complete line. Token extraction would skip an empty song and shift every later test case.

## Walkthrough

For `ccC`, the first lowercase `c` presses fingers 2, 3, 4, 7, 8, 9, and 10 once. The second `c` changes nothing, so no count increases. Uppercase `C` uses only finger 3, which was already held; it also creates no new press while the other fingers become released.

If another lowercase `c` follows, fingers 2, 4, 7, 8, 9, and 10 must be pressed again, while finger 3 remains held. This shows why note occurrence counts alone cannot produce the answer.

## Why it works

Initially, `previous` is all false, exactly matching the released starting state. Assume it correctly describes the fingering before a note. The lookup table produces the exact current fingering, so `current[i] && !previous[i]` is true precisely for a released-to-pressed transition of finger `i`.

The algorithm increments only those transitions and then stores the correct new state. By induction across the song, every physical press is counted once and no held finger is counted again.

## Complexity

For a song of length `L`, ten fingers are checked per note, so time is `O(10L)=O(L)`. The table, states, and counters use `O(1)` extra space beyond the input line.

## Common mistakes

- Incrementing for every note that uses a finger, even when it stays held.
- Reading songs with `operator>>` and skipping empty lines.
- Treating uppercase and lowercase notes as the same fingering.
- Reusing finger state or counters between songs.
