`next` is indexed by the explicit input source. `removed` records Kahn peeling order, whose reverse guarantees that each successor has a finished reach value. Positive residual indegree identifies cycle vertices.

Each new cycle is collected before assigning its common size. `reach[start]==0` skips cycles already processed. The best scan begins with ID zero and updates only for a strictly larger count, then converts back to one-based output.
