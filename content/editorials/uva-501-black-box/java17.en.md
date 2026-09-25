The requested rank increases by exactly one at every GET. Maintain a max-heap `lower` containing the already claimed smallest elements and a min-heap `upper` containing all remaining elements, with every `lower` value no greater than every `upper` value.

Before a query, add values until the required prefix length is present. If a new value is smaller than `lower.top()`, insert it into `lower` and move that heap's maximum to `upper`; this keeps `lower` at its old size while restoring the correct smallest set. Otherwise insert directly into `upper`.

For the GET itself, move `upper.top()`, the smallest remaining element, into `lower`. The new `lower.top()` is the requested next order statistic. Repeated values in `u` still perform separate GET operations even though no new value is added.

The max-heap lower contains the smallest values up to the rank already printed; the min-heap upper holds the rest. Each GET moves upper’s minimum into lower, exposing the next rank.
