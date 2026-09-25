For each string, examine every pair of positions with a double loop and increment only on strict greater-than. Equal letters do not form an inversion. With length fifty, at most 1225 comparisons per string make this direct definition-based method sufficient.

Store the score beside the untouched original string. Apply a stable sort whose comparison uses only the score. Sorting a normal `(score,string)` pair would introduce lexicographic text order for ties and violate the required stability. The characters inside each DNA string are never rearranged.

Count every inversion pair in each DNA string. Sort only by that score, preserving original order among ties and leaving the strings untouched.
