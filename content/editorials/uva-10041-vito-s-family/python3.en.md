The average is a familiar way to find a center, but this problem minimizes absolute distances, not squared distances. For positions `1, 1, 100`, choosing 1 costs 99, while the average 34 costs 132. An outlier should not pull the home that far away.

Instead, first consider just two positions a ≤ b. Any home between them gives total distance b − a; moving outside that interval makes the total larger. Sort all positions and pair the leftmost relative with the rightmost, then the next leftmost with the next rightmost.

To minimize every pair together, choose a point inside all those nested intervals. Their common intersection is the middle position for odd R, or the interval between the two middle positions for even R. In other words, choose a median. Then one pass sums the distances to that home.

For an even number of addresses, either median is optimal; the upper median works.
