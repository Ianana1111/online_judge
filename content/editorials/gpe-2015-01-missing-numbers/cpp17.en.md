The outer zero-based index `i` makes the current list length `initialSize-i`. Each number is XORed into `current` immediately, so processed list elements never need to be stored.

The first iteration establishes `previous`. Later iterations print `previous ^ current` before assigning `previous=current`; reversing those operations would always print zero. The implementation performs no deduplication. XOR cancellation works by occurrence parity, so repeated values and reordered lists remain valid under the guarantee that exactly one occurrence is removed.
