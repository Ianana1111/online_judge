Evaluate a given prefix arithmetic expression that consists of postive integer constants and binary operators +, -, \*, /, and %. The meanings of the operators are standard. In particular, / and % are integer division for quotient and remainder, respectively. In case the expression is an illegal prefix expression, report it as "illegal".

You may assume that the expression contains only digits, spaces, and the five operators mentioned above.

### Input

The input consists of multiple datasets, followed by a line which contains only a single ‘.’ (period). Each dataset represents a test data. Each dataset contains a prefix expression. The size of each line of an expression will be at most 1024. Each symbol or number is separated by at least one space.

### Output

For each case, the output should indicate the calculation result of the input prefix expression. If the input expression is illegal, the output is the string “illegal”.

### LOCAL 運算規則

字面常數必須是大於零的十進位整數；負數須由二元減法等子式產生，不能把 -3 視為單一常數。中間結果可以是零或負數。整數除法向零截斷，餘數為被除數減去商乘除數。運算過程的除數若為零，包含除法與餘數，輸出 illegal。
