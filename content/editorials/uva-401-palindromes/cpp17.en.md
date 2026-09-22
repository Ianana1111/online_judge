The map first receives every self-mirroring character, then both directions of the four asymmetric pairs. A character such as `B` is absent, and `find == end` immediately makes the mirrored property false.

The loop visits the full string. Although this checks endpoint pairs twice, it also guarantees that the center is included and the input is tiny. `palindrome` and `mirrored` are updated separately. Output handles the both-true case first, then each single property, then neither; two final newline characters create the required blank line.
