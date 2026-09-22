This problem is about calculations with large numbers. Large means numbers with at most one thousand
digits. The operations are limited to addition, substraction, multiplication and raising to a higher power.

There are no limitations to the operants of addition, substraction and multiplication. The base in
raising to higher powers is positive and smaller than ten. The exponent is positive.

The inputfile consists of a valid expression with any number of operations. There are no parentheses,
but the normal arithmetic priority rules are still valid.

An example of a valid expression is: 12345678 \* 129876 + 2\*\*1993. An invalid expression is:
12345678 \* 129876 + 12\*\*1993 because the base is greater than nine.

### Input

The input contains several test cases, each one on a different line.

Each test case contains numbers and operands in the following way:

```
n op n {op n}.
```

n is a positive decimal number with at most one thousand digits, stored as an ASCII-text. op is
one of the following: '+', '-', '\*', '\*\*' (\*\* means "raising to higher powers"). There can be at most one
hundred operations per test case. There are no spaces or other illegal characters in the input.

### Output

The output contains the exact result of the evaluated expressions given in the input. Print each test
case in a different line (in the sample below, the output line is splited by visual reasons, but it must be
just a line in your output).

Each test case won't have more than three thousand characters.

### LOCAL platform limits and exponent convention

本站每個輸入檔最多 50 個算式。保留每個正整數字面值最多 1000 位、每式一至 100 個運算子的限制。依優先序求值時，每個運算結果與最後答案的絕對值都必須小於 10³⁰⁰⁰，負號不列入位數；三千位限制指運算數值，並非輸入字串長度。乘冪採右結合（例如 2**3**2 = 2**(3**2)），先乘冪、再乘法、最後加減；加減與乘法均由左至右。每個乘冪的底數為一至九、指數為正整數。這是明示的本站可評測規格，正式發布前會完成完整邊界驗證。輸出必須一個整數佔一行，原 PDF 的反斜線只是印刷續行符號，不是答案的一部分。
