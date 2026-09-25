This does not require slopes or line intersections. Let the shared endpoint be `P` and the two other endpoints be `A` and `B`. The side vectors leaving `P` are `A-P` and `B-P`, so the opposite vertex is

`D = P + (A-P) + (B-P) = A+B-P`.

The sum of all four input points is `A+B+2P`, because `P` appears twice. Once the matching endpoint is found, subtracting `3P` from that total yields `A+B-P`, the desired point.

All coordinates have at most three decimal digits. Convert them to integer millimeters before doing the additions and subtractions. The answer remains an exact integer number of millimeters, avoiding floating-point output artifacts such as negative zero.

Find the endpoint P shared by both sides. The missing corner is A+B−P for the other endpoints A and B. Integer millimetres preserve exact three-decimal output.
