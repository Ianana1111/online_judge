`DSU` allocates indices zero through N and initializes every computer as its own parent. `find` performs path halving: each visited node points to its grandparent before traversal continues. This shortens future searches without recursion.

`join` first replaces both vertices with their roots. Equal roots need no work. Otherwise, the smaller root is attached to the larger root and its size is added to the surviving set.

After reading the test count, `getline` consumes the remainder of that header. The case parser skips blank separator lines before N and then reads commands until the next blank line or EOF. A fresh DSU and fresh `yes`/`no` counters are created for every case. Only query commands affect those counters.
