Use full-line input so each line remains one case. Count only codes in the uppercase or lowercase ASCII ranges, updating the current maximum after each increment. Reinitialize both counts and maximum for every line.

After counting, scan an explicit 52-character alphabet string in the required order and print every character whose count equals the maximum. Require the maximum to be positive; otherwise all 52 absent letters have count zero and must not be printed.

Separating counting from ordered output naturally retains every tie, including a letter that reaches the maximum later in the line.

Create fresh counts per line; `alphabet` explicitly places uppercase before lowercase.
