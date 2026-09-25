Members of one team always form one contiguous block. Store the order of nonempty team blocks in an `active` queue, and store each team's internal FIFO order in its own `members[t]` queue.

When a member arrives, add the team to `active` only if its member queue is currently empty, then append the member to that team queue. For DEQUEUE, use the team at the front of `active`, remove and print its front member, and remove the team from `active` if its queue becomes empty. If that team later receives another member, it correctly creates a new block at the then-current line end.

A direct member-to-team lookup avoids searching team definitions during commands.

A team’s members remain contiguous. Queue active teams externally and keep an internal queue for each team. Add a team externally only when it becomes nonempty, and remove it when its own queue empties.
