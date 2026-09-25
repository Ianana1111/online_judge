Counting all perfect matchings would include crossing handshakes. Instead, fix the first person and consider their partner. Their handshake is a chord that divides the remaining people into two groups. No other handshake may cross that chord, so each group must pair internally.

Both groups need an even number of people. If one side contains k pairs, the other contains N − 1 − k pairs. The choices on the two sides are independent, so they contribute `ways[k] * ways[N − 1 − k]` possibilities. Add this product for every k from zero through N − 1.

This gives the Catalan recurrence. The important base is `ways[0] = 1`: an empty side has one valid completion, requiring no further handshakes. It must not multiply the other side's choices by zero.

The empty structure has one way, so `ways[0] = 1`; leave a blank line between cases.
