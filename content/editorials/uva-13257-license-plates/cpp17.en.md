The sentinel row at index n contains n for every letter. Each earlier row copies the next suffix then overwrites its current character, making every entry the earliest occurrence from that position.

Failed first or second jumps immediately continue, avoiding an `n+1` lookup. Successful next searches start at the chosen index plus one, enforcing distinct increasing positions. All three loops span all 26 letters without alphabetical-order restrictions, and zero test cases produce no output.
