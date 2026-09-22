Each circle is `(center_x, center_y, squared_radius)`. `diameter` computes the midpoint as fractions. `outside` uses a strict greater-than comparison, so equality counts as inside.

`through_three` shifts the calculation relative to a. Its determinant is twice the cross product of the two relative vectors. A zero determinant selects the largest pairwise diameter circle; otherwise the two rational offsets solve the perpendicular-bisector equations and give the circumcenter.

`minimum_circle` copies and deterministically shuffles the input before its nested incremental scans. The loop indices limit each repair to points already encountered. Finally, `Fraction` reads the supplied decimal radius exactly, and comparing `squared <= radius * radius` chooses one of the statement's two required sentences without a floating-point tolerance.
