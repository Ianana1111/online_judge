`while (cin >> n)` processes values until EOF; there is no sentinel value. Because `n` is positive, integer division `n / 2` is exactly the required floor.

The first `n` in the expression counts the purchased colas, and `n / 2` counts the maximum additional drinks obtained through exchanges and one possible repayable loan. The proof handles the borrowing rule, so the implementation does not need to simulate bottle debt.
