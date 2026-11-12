Reading 250,000 numbers with `Scanner` is slow in Java, so this program reads 64 KB blocks through `DataInputStream` and assembles numbers byte by byte: a digit multiplies `n` by 10 and adds the digit, and any non-digit byte (newline, space, `\r`) ends the current number.

When a number ends, the program first checks for 0 and breaks out of the loop if so; otherwise it appends the result of `n <= 100 ? 91 : n - 10` to a `StringBuilder`. The block after the loop covers a final number that is not followed by a newline, so a file that ends right after a digit is still handled.

Everything is printed with a single `System.out.print` call, avoiding per-line output costs.
