The zero-initialized table permits unused capacity and does not require exact filling. For every item, capacity descends from 30 to its weight, so `best[capacity-weight]` has not yet used the current item.

The item record can be discarded after updating the shared table. Each family-member capacity then contributes a lookup to `total`; repeated capacities are added repeatedly because they belong to different people with independent choices.
