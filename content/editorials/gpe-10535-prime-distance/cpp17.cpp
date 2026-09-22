#include <bits/stdc++.h>
using namespace std;
const long long MOD = 1000000007;
long long chooseSmall(long long n, int r) {
    if (n < r) return 0;
    const long long inverseFactorial[4]{1, 1, 500000004, 166666668};
    long long answer = 1;
    for (int i = 0; i < r; ++i) answer = answer * (n - i) % MOD;
    return answer * inverseFactorial[r] % MOD;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 100000;
    vector<bool> prime(limit + 1, true); prime[0] = prime[1] = false;
    for (int p = 2; p * p <= limit; ++p) if (prime[p]) for (int multiple = p * p; multiple <= limit; multiple += p) prime[multiple] = false;
    vector<long long> primeCount(limit + 1), primeSum(limit + 1), twinCount(limit + 1), twinSum(limit + 1);
    for (int value = 1; value <= limit; ++value) {
        primeCount[value] = primeCount[value - 1] + prime[value];
        primeSum[value] = primeSum[value - 1] + (prime[value] ? value : 0);
        bool twin = value >= 3 && prime[value] && prime[value - 2];
        twinCount[value] = twinCount[value - 1] + twin;
        twinSum[value] = twinSum[value - 1] + (twin ? value : 0);
    }
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        long long n, m; cin >> n >> m;
        long long countTwo = n * primeCount[n - 1] - primeSum[n - 1];
        long long countThree = 2 * (n * twinCount[n - 1] - twinSum[n - 1]);
        long long countFour = max(0LL, n - 7);
        long long supports[5]{0, n, countTwo, countThree, countFour};
        long long answer = 0;
        for (int size = 1; size <= 4; ++size) answer = (answer + supports[size] % MOD * chooseSmall(m - 1, size - 1)) % MOD;
        cout << "Case " << tc << ": " << answer << '\n';
    }
}
