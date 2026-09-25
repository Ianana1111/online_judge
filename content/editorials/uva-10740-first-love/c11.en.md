Ordinary Dijkstra finalizes each vertex once, but here several different prefixes reaching the same vertex can lead to different ranked complete walks. Treat every heap record `(distance,u)` as one concrete walk prefix. Start with the empty source walk at distance zero.

Pop records in nondecreasing distance. Accept and expand at most K arrivals per vertex; later arrivals are discarded. When the target is accepted for the Kth time, that distance is the answer. The first K-1 target arrivals must still be expanded, because a legal walk may reach the target, follow a cycle, and return.

Do not deduplicate equal distances. Zero-weight cycles can create many distinct walks with the same length, but the K-arrival cap still guarantees finite expansion.

Each heap item represents one concrete walk to a vertex. After a vertex has been popped K times, later prefixes cannot contribute to the first K walks, so expand it at most K times; the target’s K-th pop gives the answer.
