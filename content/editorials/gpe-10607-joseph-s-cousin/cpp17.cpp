#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<int> primes;
    for (int candidate = 2; primes.size() < 3500; ++candidate) {
        bool prime = true;
        for (int divisor : primes) { if (divisor * divisor > candidate) break; if (candidate % divisor == 0) { prime = false; break; } }
        if (prime) primes.push_back(candidate);
    }
    int n;
    while (cin >> n && n) {
        int survivor = 0;
        for (int size = 2; size <= n; ++size) survivor = (survivor + primes[n - size]) % size;
        cout << survivor + 1 << '\n';
    }
}
