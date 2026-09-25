The path completes a square of side k exactly at time `k^2`. Find the smallest k with `k^2>=N`; then `(k-1)^2<N<=k^2`, so N lies on layer k. Integer binary search avoids floating square-root boundary errors.

Let `d=k^2-N`, the backward distance from the layer endpoint. First use the even-layer orientation, whose endpoint is `(k,1)`. If `d<k`, move along the right column to `(k,d+1)`. Otherwise move along the top row to `(2k-1-d,k)`. Odd layers are the diagonal reflection of even layers, so swap x and y when k is odd.

Binary-search the smallest square layer k containing N, avoiding square-root boundary errors. Walk backward from k² and swap coordinates on odd layers.
