First compute `palindrome[left][right]`. An interval is palindromic when its endpoints match and its interior is palindromic; intervals of length one or two need no interior lookup. Iterate `left` from right to left so every required interior state is ready.

Let `groups[end]` be the minimum groups covering the first `end` characters, with `groups[0]=0`. Choose the start `begin` of the final segment. Whenever `s[begin..end-1]` is palindromic, update from `groups[begin]+1`. Trying every final segment yields the optimum.

Precompute whether each substring is a palindrome from short spans to long spans. Then let groups[end] try every start of the final palindrome and add one to the best partition of the preceding prefix.
