Inserting IDs into `set` deduplicates repeated cards automatically and does not depend on input ordering. Each range loop increments its counter only if the opposite set lacks that ID.

The minimum of the two exclusive counters is the number of pairs, not the total number of newly received types across both people. New sets and counters are constructed per dataset, and the double-zero sentinel is not processed.
