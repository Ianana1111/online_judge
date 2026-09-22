Both endpoints are read directly into `long long`, so division around multiples of five remains exact. Since legal query endpoints are positive, C++ truncating integer division equals mathematical floor.

The loop excludes only the joint-zero sentinel. The quotient difference counts block boundaries crossed and `+1` includes the starting block. A single-point query therefore returns one, and a multiple of 25 still creates only one new distinct attained value regardless of jump size.
