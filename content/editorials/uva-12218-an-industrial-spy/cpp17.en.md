The prime sieve is built once for every test case, with zero and one explicitly marked nonprime. `search(0,0)` begins from an uncounted empty prefix, rejects zero only in the first position, and permits zero later, so values such as 101 remain reachable.

Each branch decrements one entry of `remaining` and restores it after returning. Primality is checked upon entering every node, which counts valid shorter prefixes without requiring all fragments. The loop branches by digit value rather than fragment identity, so repeated equal fragments do not duplicate a decimal string.
