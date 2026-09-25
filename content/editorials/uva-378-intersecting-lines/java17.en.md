Represent each line by a starting point and direction vector. If the direction cross product is zero, test whether the displacement of starting points is parallel too: that separates `LINE` from `NONE`. Otherwise `t=cross(C-A,v)/cross(u,v)` gives the unique intersection.

With input coordinates bounded by ±1000, `long` safely holds determinants and coordinate numerators. Round the final rational coordinates with integer arithmetic to two decimal places and suppress a negative sign when the rounded value is zero.
