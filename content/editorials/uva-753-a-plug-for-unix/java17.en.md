Separate compatibility from capacity. Adapters determine which outlet types a plug can reach; physical receptacles determine how many devices can connect simultaneously. Adapter supply is unlimited, so adapters need no occupied/unoccupied state.

Build a directed graph of plug types. Adapter a b lets an a-type plug become b-type, then continue through other adapters. Never reverse it or make it undirected. BFS from each device's original plug type, including the original type without an adapter, identifies compatible physical outlets.

Now solve bipartite maximum matching: devices on the left and individual receptacles on the right. owner records each outlet's device. An augmenting search may move that device elsewhere before assigning the outlet to a new one, correcting previous choices instead of using irreversible first-come-first-served greediness.

Reset seen for each new device; within one search, never retry an outlet. Maximum matching is the number connected, so subtract it from the total device count. Type names are case-sensitive; device names are merely labels. Separate answers with a blank line.

With V types, K adapters, M devices and N outlets, reachability takes O(M(V+K)); matching has a conservative O(M²N) bound. Space is O(V+K+MN).
