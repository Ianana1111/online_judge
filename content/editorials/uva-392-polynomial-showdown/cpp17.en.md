Array index `i` maps to degree `8 - i`, so the program naturally preserves the required descending order. It tests `c == 0` before any sign logic, preventing leading zeros from affecting `first`.

The sign is separated from `magnitude = abs(c)`, so a negative value cannot print two minus signs. The coefficient condition explicitly includes constants; variable and exponent output use separate positive-degree checks. `first` becomes false only after a real term is written, and remaining true after the loop identifies the all-zero polynomial.
