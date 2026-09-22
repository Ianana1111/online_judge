The “Gold Bar” bank received information from reliable
sources that in their last group of N coins exactly one coin
is false and differs in weight from other coins (while all other
coins are equal in weight). After the economic crisis they
have only a simple balance available (like one in the picture).
Using this balance, one is able to determine if the weight of
objects in the left pan is less than, greater than, or equal to
the weight of objects in the right pan.

In order to detect the false coin the bank employees numbered all coins by the integers from 1 to N , thus assigning
each coin a unique integer identifier. After that they began to weight various groups of coins by placing
equal numbers of coins in the left pan and in the right pan. The identifiers of coins and the results of
the weightings were carefully recorded.

You are to write a program that will help the bank employees to determine the identifier of the false
coin using the results of these weightings.

### Input

The first line of the input is an integer M , then a blank line followed by M datasets. There is a blank
line between datasets.

The first line of each dataset contains two integers N and K, separated by spaces, where N is the
number of coins (1 ≤ N ≤ 100) and K is the number of weightings fulfilled (1 ≤ K ≤ 100). The
following 2K lines describe all weightings. Two consecutive lines describe each weighting. The first of
them starts with a number Pi (1 ≤ Pi ≤ N /2), representing the number of coins placed in the left and
in the right pans, followed by Pi identifiers of coins placed in the left pan and Pi identifiers of coins
placed in the right pan. All numbers are separated by spaces.

The second line contains one of the following characters: ‘\<’, ‘\>’, or ‘=’. It represents the result of
the weighting:

- ‘\<’ means that the weight of coins in the left pan is less than the weight of coins in the right pan,
- ‘\>’ means that the weight of coins in the left pan is greater than the weight of coins in the right
pan,
- ‘=’ means that the weight of coins in the left pan is equal to the weight of coins in the right pan.

### Output

For each dataset, write to the output file the identifier of the false coin or ‘0’, if it cannot be found by
the results of the given weightings.

Print a blank line between datasets.

### 本平台補充：無法唯一判定

本平台將「無法判定」明確定義為符合全部秤重紀錄的候選硬幣編號不是恰好一個。若紀錄彼此矛盾，導致沒有任何偏輕或偏重假設符合，也輸出 `0`。這是平台針對既有紀錄的補充約定；原始題目未另外說明矛盾紀錄的情況。

若只剩同一枚硬幣的偏輕與偏重兩種可能，仍能唯一確定其編號，應輸出該編號。秤重兩側同枚數、每枚硬幣在同次秤重僅出現一次等其他輸入規則不變。
