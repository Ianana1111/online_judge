For valid even `N`, require `N/2` ones. Fix the leading bit as 1. Let `dp[ones][remainder]` count current-length prefixes. Initialize `dp[1][1%K]=1`.

Appending bit zero changes remainder to `2r mod K`; appending one changes it to `(2r+1) mod K` and increments `ones`. Use a new layer for each length. After reaching exactly `N`, select `ones=N/2` and remainder zero. Never construct the 64-bit signed numeric value itself.

Fix the leading bit to one and choose each remaining bit. A state stores the number of ones and the current remainder modulo K; appending bit b changes the remainder to (2r+b) mod K.
