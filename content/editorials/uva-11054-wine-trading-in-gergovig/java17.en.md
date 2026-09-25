Consider the boundary after house i. Let prefix balance `S_i=a_1+...+a_i`. If positive, the left side must receive exactly that many net bottles from the right; if negative, it must send `-S_i` out. Therefore every solution pays at least `abs(S_i)` work across that edge.

Scan left to right, update the signed balance, and add its absolute value to the answer at each boundary. The final total balance is zero, so including its final absolute value adds nothing.

Do not replace balance itself by its absolute value; its sign is needed when later supply and demand cancel.

Input includes negative numbers, so the fast reader handles the sign; accumulated values use `long`.
