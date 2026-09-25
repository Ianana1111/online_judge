Sort products by increasing deadline. Maintain a minimum heap of profits selected so far and their running total. Insert each product. If the selected count now exceeds the current deadline, there are too few available slots, so remove the smallest profit.

Because prior selections fit the previous, no-later deadline and one product was added, at most one removal is needed. The remaining products can be scheduled in deadline order; an exact-deadline completion remains valid.

Sort products by deadline and keep chosen profits in a min-heap. At deadline d, at most d jobs fit; if an added product exceeds that capacity, discard the lowest profit.
