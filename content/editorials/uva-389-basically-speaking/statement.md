The Really Neato Calculator Company, Inc. has recently hired your team to help design their Super
Neato Model I calculator. As a computer scientist you suggested to the company that it would be neato
if this new calculator could convert among number bases. The company thought this was a stupendous
idea and has asked your team to come up with the prototype program for doing base conversion. The
project manager of the Super Neato Model I calculator has informed you that the calculator will have
the following neato features:

- It will have a 7-digit display.
- Its buttons will include the capital letters A through F in addition to the digits 0 through 9.
- It will support bases 2 through 16.

### Input

The input for your prototype program will consist of one base conversion per line. There will be three
numbers per line. The first number will be the number in the base you are converting from. It may have
leading ‘0’s. The second number is the base you are converting from. The third number is the base you
are converting to. There will be one or more blanks surrounding (on either side of) the numbers. There
are several lines of input and your program should continue to read until the end of file is reached.

### Output

The output will only be the converted number as it would appear on the display of the calculator.
The number should be right justified in the 7-digit display. If the number is too large to appear on the
display, then print the rightmost 7 digits. If the number is small, then put some zeros in front of the number
such that 7 digits are printed out.

### 本站版本說明

本題採用固定七位數字顯示規則：不足七位左側補零，超過七位保留最右七位。這與原 UVa 389 的補空白及 ERROR 規則不同，請依本頁規格作答。
