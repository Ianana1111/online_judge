The memo index flattens `remaining`, `fives`, and `tens`. `totalValue` and the original bottle count are fixed within one case, so `ones` is reconstructed exactly at each call. Zero remaining bottles returns zero insertions.

Each conditional corresponds to one normal-form payment and first checks its required coins. Only fives and tens are passed to the next state; the conservation equation accounts for consumed ones and received change. The final transition increases fives by one while spending a ten and three ones.

`maxFive=initial fives+initial tens` covers every possible such conversion, while `maxTen` is the initial ten count. A fresh `-1` memo array is allocated per case so results never mix wallets with different total values.
