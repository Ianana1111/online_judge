#include <bits/stdc++.h>
using namespace std;
pair<long long, long long> fibonacci(long long n, long long mod) {
    if (n == 0) return {0, 1 % mod};
    auto [a, b] = fibonacci(n / 2, mod);
    long long c = a * ((2 * b - a + mod) % mod) % mod;
    long long d = (a * a + b * b) % mod;
    if (n % 2 == 0) return {c, d};
    return {d, (c + d) % mod};
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n; int m;
    while (cin >> n >> m) {
        long long mod = 1LL << m;
        cout << fibonacci(n, mod).first << '\n';
    }
}
