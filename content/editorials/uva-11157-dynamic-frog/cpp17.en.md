`points` starts with two zeros, representing the left endpoint of both left-to-right paths. Each big stone is appended twice, each small stone once, and two copies of `distance` finish the list.

Indices of the same parity form one path, so `points[i] - points[i-2]` measures consecutive stops on that path. Taking the maximum over these gaps replaces any need to simulate destroying small stones or to enumerate route assignments.
