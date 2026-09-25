Some suffix of the original string will sit in the middle of the completed palindrome without needing newly appended partners. That suffix must itself be palindromic, and preserving a longer suffix means appending fewer characters. Therefore find the longest palindromic suffix.

Let `r` be the reverse of `s`. Compute the KMP prefix function on `r + '#' + s`, where `#` cannot occur in the input. The final prefix value is the longest prefix of `r` equal to a suffix of `s`. A prefix of `r` is the reverse of the corresponding suffix of `s`, so equality holds exactly when that suffix is a palindrome.

If its length is `L`, take the unmatched prefix `s[0:n-L]`, reverse it, and append it.

Keep the longest palindromic suffix. KMP on reverse(s)+separator+s finds its length, and reversing the unmatched original prefix gives the shortest append-only palindrome.
