Notice that vertices arrive in arbitrary order, and averaging vertex coordinates generally does not give the centroid of a uniformly filled polygon. Recover boundary order, then weight positions by area.

This version sorts by x and y and builds lower and upper convex hulls using cross products. All given points are vertices of a convex polygon, with no three collinear, so the hull contains exactly those points in boundary order. Remove the last point on a nonpositive turn to maintain counterclockwise order.

Adjacent vertices (x,y) and (u,v), together with the origin, form a signed triangle with doubled area c=xv−yu and centroid ((x+u)/3,(y+v)/3). Summing signed area-weighted centroids gives X=Σ((x+u)c)/(3Σc) and Y=Σ((y+v)c)/(3Σc). Signed contributions cancel correctly even when the origin lies outside the polygon.

`cross` checks hull turns; `moment_x` and `moment_y` store weighted numerators. Only the final `format_ratio`/`fixed` rounds to three decimals. Exact integer intermediates protect large coordinates and thin polygons from floating-point errors. Sorting takes O(N log N), hull construction and accumulation O(N), and storage O(N), excluding integer lengths.
