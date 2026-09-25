The first word costs all `K` characters. Between previous and next words, if a suffix of length `L` from the previous word equals a prefix of length `L` from the next, preserve those cells and enter only `K-L` characters. Search `L` from `K` down to zero; the first match is the maximum overlap and minimum local addition.

After a word is fully displayed, the sign state is exactly that word, so earlier scrolling history cannot affect the next transition. Pairwise minimum additions therefore sum to the global minimum.

Only the previous word remains on the display. Find its longest suffix matching the next word’s prefix; the number of new characters is K minus that overlap.
