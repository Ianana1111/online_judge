The denominators are powers of two and all divide 64. Multiplying every duration by 64 changes the note values to `64, 32, 16, 8, 4, 2, 1`; a complete measure now has the exact integer sum 64. This avoids approximate arithmetic entirely.

Scan the song from left to right. Add each note's scaled duration. At every slash, count the preceding measure only when its sum equals 64, then reset the sum. The leading slash simply examines an empty sum, and the trailing slash performs the final real check.

Stop the entire input at `*`; reset counts for every new song.
