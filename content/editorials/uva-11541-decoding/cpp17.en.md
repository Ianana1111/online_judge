The outer loop takes `encoded[i++]` as the letter and initializes a fresh count. The digit loop checks bounds before character range, then advances after incorporating each decimal digit.

`decoded.append(count,letter)` runs after every digit scan, including the final one. A new result string is created per case and printed with the exact one-based case label and spacing.
