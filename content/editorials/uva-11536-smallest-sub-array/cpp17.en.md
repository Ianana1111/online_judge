The first three vector entries are assigned directly; recurrence generation begins at index 3 and includes the required `+1`. Frequency storage has indices through `k`, and values are accessed only after confirming `value<=k`.

The prefix increment test recognizes a newly covered value, while the prefix decrement test recognizes the loss of its final copy. The shrinking loop records a valid inclusive length before removing the left endpoint. `n+1` is an impossible sentinel and cannot conflict with a valid full-length answer.
