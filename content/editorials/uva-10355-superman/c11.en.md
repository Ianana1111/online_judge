Parameterize the flight as `P(t)=A+tV`, where `V=B-A` and `0<=t<=1`. For a sphere with center `C` and radius `r`, points inside it satisfy

`|P(t)-C|^2 <= r^2`.

Expanding gives `a*t^2+2*b*t+c <= 0`, with `a=V dot V`, `b=(A-C) dot V`, and `c=|A-C|^2-r^2`. Its discriminant in this form is `D=b^2-a*c`. A negative value misses the sphere, while zero is a tangent and contributes no length. For positive `D`, the infinite line lies inside the sphere between roots `(-b-sqrt(D))/a` and `(-b+sqrt(D))/a`.

Those roots belong to the infinite line, so intersect their interval with `[0,1]`. This clipping handles spheres beyond an endpoint and flights that begin inside a sphere. Since movement along `P(t)` has constant speed, the clipped interval length is exactly the fraction of the complete flight spent inside that sphere. Sum these fractions; disjoint interiors guarantee no double counting.

Parameterize the flight segment from 0 to 1. Solve the squared-distance quadratic for each sphere to find entry and exit parameters, intersect that interval with [0,1], and sum its length as the route fraction.
