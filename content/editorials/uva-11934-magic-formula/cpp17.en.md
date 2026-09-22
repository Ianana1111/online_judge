The input condition reads all five values and checks their logical OR, preventing modulo by the sentinel divisor zero. Valid cases always have a nonzero divisor even when other fields are zero.

All operands are `long long`, and Horner evaluation uses two exact multiplications. Negative remainders remain safe when compared with zero. The inclusive loop executes once for `limit=0`, and the answer resets per case.
