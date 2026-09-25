The input N is the number of entries in a row, not the row index. Row r contains `2r−1` entries, so `r=(N+1)/2`. The first r rows contain `1+3+...+(2r−1)=r²` positive odd numbers. Since the kth positive odd number is `2k−1`, the last entry of this row is `2r²−1`. The final three entries differ by two each and sum to `3 * last−6`. No row needs to be built. Read until EOF and keep the multiplication in a 64-bit type in C and Java.

The java17 program implements this reasoning directly and follows the exact input terminator and output format.
