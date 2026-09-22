# Represent the line as a queue of team queues

## Problem and constraints

Every member belongs to one team. On ENQUEUE, a member joins immediately after the last queued teammate if that team is present; otherwise the member joins the end of the full line. DEQUEUE removes the front member. There may be up to 1000 teams and 200000 commands, so each operation must be constant time.

## Building the approach

Members of one team always form one contiguous block. Store the order of nonempty team blocks in an `active` queue, and store each team's internal FIFO order in its own `members[t]` queue.

When a member arrives, add the team to `active` only if its member queue is currently empty, then append the member to that team queue. For DEQUEUE, use the team at the front of `active`, remove and print its front member, and remove the team from `active` if its queue becomes empty. If that team later receives another member, it correctly creates a new block at the then-current line end.

A direct member-to-team lookup avoids searching team definitions during commands.

## Walkthrough

Let team A contain 1,2 and team B contain 3,4. Enqueuing 1,3,2 produces member order 1,2,3. After dequeuing twice, A disappears. Enqueuing 1 now puts a new A block after 3; enqueuing 4 joins teammate 3 before that block, yielding 3,4,1.

## Why it works

Assume concatenating team queues in `active` order equals the real line. An arrival to an active team appends to that exact block; an arrival to an absent team creates the required final block. A departure removes the first member of the first block, and deleting an empty block changes no remaining member order. Thus every operation preserves the representation invariant, and each reported departure is the real line's front member.

## Complexity

Building membership lookup is linear in listed members. Every command performs deque operations in `O(1)` time. Space is the fixed membership map plus team containers and the number of currently queued members.

## Common mistakes

- Using one ordinary FIFO queue and separating teammates.
- Scanning the whole line to find the final teammate.
- Leaving an empty team in the active queue.
- Reusing a vanished team's old block position.
- Using a stack inside a team and reversing teammate order.
