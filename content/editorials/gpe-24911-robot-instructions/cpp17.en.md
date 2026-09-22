The movement vector has `n+1` slots so problem instruction numbers can be used directly; index zero is unused. After reading `SAME`, the program consumes the `AS` token and previous instruction number, then copies the already normalized `-1` or `+1` value.

Position updating is shared after all three parsing branches, ensuring every instruction executes once. Both the vector and position are declared inside the case loop. Output contains only the final position, without intermediate traces.
