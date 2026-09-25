Use a vector as the station stack and let `next` be the smallest coach not yet arrived. Process target coaches in order. If the wanted coach is already on top, pop it. Otherwise, the only possible action is to push arriving coaches in order until the wanted coach reaches the top or no arrivals remain.

If all coaches have arrived and the top is still different, the wanted coach is trapped below another one and the target is impossible. Read the entire permutation before simulation so that an early failure never leaves unread coaches to be mistaken for the next query.

There is no useful branching: popping a different top coach would immediately violate output order, while delaying a matching top by pushing more coaches only blocks it.

If the wanted coach is on top, release it; otherwise the only legal move is to push arrivals in order. Read each whole target permutation before simulating.
