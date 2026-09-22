After extracting the line count, `ignore` consumes the rest of that line. Exactly `lines` calls to `getline` follow, so an empty text line remains part of the dataset. Lowercase conversion uses explicit ASCII ranges, and the subsequent uppercase check protects the count index from punctuation.

`iota` builds letter indices without moving count values. The comparator first orders unequal frequencies descending and only then indices ascending, forming a strict ordering. Output filters positive counts, so an article without letters produces no artificial header.
