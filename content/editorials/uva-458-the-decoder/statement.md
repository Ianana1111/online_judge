Write a complete program that will correctly decode a set of characters into a valid message. Your
program should read a given file of a simple coded set of characters and print the exact message that
the characters contain. The code key for this simple coding is a one for one character substitution based
upon a single arithmetic manipulation of the printable portion of the ASCII character set.

### Input and Output

For example: with the input file that contains:

```
1JKJ'pz'{ol'{yhklthyr'vm'{ol'Jvu{yvs'Kh{h'Jvywvyh{pvu5
1PIT'pz'h'{yhklthyr'vm'{ol'Pu{lyuh{pvuhs'I|zpulzz'Thjopul'Jvywvyh{pvu5
1KLJ'pz'{ol'{yhklthyr'vm'{ol'Kpnp{hs'Lx|pwtlu{'Jvywvyh{pvu5
```

your program should print the message:

```
*CDC is the trademark of the Control Data Corporation.
*IBM is a trademark of the International Business Machine Corporation.
*DEC is the trademark of the Digital Equipment Corporation.
```

Your program should accept all sets of characters that use the same encoding scheme and should
print the actual message of each set of characters.

### 本站編碼規則補充

本題沿用本站既有的可列印 ASCII 循環版本。資料字元介於 ASCII 32（空格）與 126（~），共 95 個字元；解碼時 ASCII 值減 7，若小於 32 則加回 95。LF 與 CR 換行字元保持原樣。輸入中的空格也是編碼資料，不能略過。原始範例未展示越界情況，本段明確定義本站的邊界行為。
