`lower` is the default max-heap; `upper` uses `greater<long long>` for a min-heap. The empty-lower check comes before reading its top. Since one value is inserted at a time, moving one boundary element is enough to restore balance.

Heap-top addition occurs in `long long` before division. Inputs are nonnegative, so C++ integer division matches truncation of the positive average. When lower has one extra, its top is printed directly. The read loop stops only at EOF, never on value zero.
