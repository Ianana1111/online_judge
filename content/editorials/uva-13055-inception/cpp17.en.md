The vector's end represents the current dream, so `push_back`, guarded `pop_back`, and `back` map directly to the three commands. Only `Sleep` reads a following name, preserving command token alignment.

Both kick and test check emptiness before accessing the end. The conditional expression evaluates only its selected branch, so `back()` is never called while awake. Names are stored unchanged, including case and duplicates, and the query count controls the exact number of commands read.
