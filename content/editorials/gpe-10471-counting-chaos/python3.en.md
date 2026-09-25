Trying to reverse the displayed four characters misses the leading-zero rule. Convert hours and minutes to the number `hours * 100 + minutes`, then convert that number to a string. Numeric conversion removes exactly the irrelevant leading zeros while retaining internal zeros. Midnight becomes `0`, also a palindrome.

A day has only 1,440 minutes, so enumerate them once and save every palindromic time as a minute count from midnight. This representation makes chronological comparison easy and avoids invalid values such as 12:60.

For a query, find the first saved minute **greater than** the current minute. If there is none, take the first saved minute on the next day. The current time must be skipped even if it is already a palindrome.

Form the unpadded decimal number from hour and minute as specified, test its palindrome form, and find a strictly later time.
