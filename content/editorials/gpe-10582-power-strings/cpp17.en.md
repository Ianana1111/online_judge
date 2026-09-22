`getline` preserves all spaces in a case. The optional trailing carriage return is removed to handle CRLF input; no other trimming is performed. Only `s == "."` terminates input.

For position `i`, `length = prefix[i - 1]` starts from the best border of the preceding prefix. On mismatch, `prefix[length - 1]` jumps to that border's longest proper border. A matching character extends the surviving border by one, and the result is stored in `prefix[i]`.

After the loop, `n - prefix[n - 1]` gives the candidate period. The conditional output keeps the complete-copy requirement separate from the border calculation. The statement guarantees nonempty data lines, so the final prefix entry always exists.
