Each test case creates zeroed `seen`, while `epoch` begins at one, so no value is initially present. A value forms an interval only if its mark matches the current epoch; first occurrences do not increment the answer.

When a repeat is found, the code increments `epoch` before executing `seen[value]=epoch`. That order preserves the current position as both the old interval's right endpoint and the new search's left endpoint. The input sequence need not be stored, and previous indices are unnecessary when only the maximum count is requested.
