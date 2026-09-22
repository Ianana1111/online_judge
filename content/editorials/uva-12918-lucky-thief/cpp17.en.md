Both inputs are `long long`, so every term and the product in `n*(2*m-n-1)/2` is evaluated widely. The product is always even; multiplying before dividing avoids truncating an odd `n`.

The program implements only the closed-form optimum; the matching graph is needed for the proof, not runtime. One integer is printed per case without a label, and `N=M=1` naturally yields zero.
