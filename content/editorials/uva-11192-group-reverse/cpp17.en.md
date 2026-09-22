The loop reads `groups` and tests it against zero before attempting to read `text`, so the sentinel line is handled safely. Valid input guarantees that `size = text.size() / groups` is positive and exact.

`start` advances by one group length and visits every group boundary. C++ `reverse` takes a half-open range, making `start + size` the correct second iterator. Since the ranges do not overlap, later reversals cannot disturb earlier groups.
