A search through the network could answer each query, but repeatedly exploring the same connected group wastes work. Connections are only added, so groups can merge but never split. That is exactly the situation a disjoint-set union structure models.

Initially each computer forms its own set. For a connection, find both sets' representatives and merge them. For a query, compare representatives. Use path compression and merge the smaller set into the larger to keep future searches short.

Process commands immediately in input order. Building the final network first would let future connections change answers to earlier queries. A query from a computer to itself always succeeds, and adding a connection inside an existing set changes nothing.

Process commands in arrival order: a future connection cannot change an earlier query. Blank lines separate cases, and outputs need one blank line between them.
