#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 31622; vector<bool> composite(limit+1,false); vector<int> primes;
    for (int p = 2; p <= limit; ++p) if (!composite[p]) { primes.push_back(p); for (int multiple = p*p; multiple <= limit; multiple += p) composite[multiple] = true; }
    int tests; cin >> tests;
    while (tests--) {
        long long low,high; cin >> low >> high; int length = high-low+1;
        vector<long long> remaining(length); vector<int> counts(length,1);
        for (int i = 0; i < length; ++i) remaining[i] = low+i;
        for (int prime : primes) {
            if (1LL*prime*prime > high) break;
            for (long long value = (low+prime-1)/prime*prime; value <= high; value += prime) {
                int at = value-low,exponent = 0;
                while (remaining[at] % prime == 0) { remaining[at] /= prime; ++exponent; }
                counts[at] *= exponent+1;
            }
        }
        int best = 0;
        for (int i = 0; i < length; ++i) {
            if (remaining[i] > 1) counts[i] *= 2;
            if (counts[i] > counts[best]) best = i;
        }
        cout << "Between " << low << " and " << high << ", " << low+best << " has a maximum of " << counts[best] << " divisors.\n";
    }
}
