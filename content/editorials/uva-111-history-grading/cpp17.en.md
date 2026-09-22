`getline` and `istringstream` preserve the line boundary that distinguishes a dataset size from a ranking. A one-value line resets `correct`; the next complete permutation becomes the answer key, and each later complete line is scored as one student.

The key assignment is `sequence[ranking[event] - 1] = correct[event]`: the student rank selects the position and the correct rank supplies the value. Each student receives a fresh `dp` array initialized to one, and every earlier position is considered as a possible LIS predecessor.
