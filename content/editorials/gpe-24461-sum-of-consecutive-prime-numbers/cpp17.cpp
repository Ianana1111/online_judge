#include <algorithm>
#include <array>
#include <iomanip>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    array<bool,10001> prime; prime.fill(true); prime[0] = prime[1] = false;
    for (int p = 2; p * p <= 10000; ++p) if (prime[p]) for (int j = p * p; j <= 10000; j += p) prime[j] = false;
    vector<int> primes; for (int n = 2; n <= 10000; ++n) if (prime[n]) primes.push_back(n);
    int target;
    while (cin >> target && target) {
        int left = 0, sum = 0, answer = 0;
        for (int right = 0; right < int(primes.size()) && primes[right] <= target; ++right) {
            sum += primes[right];
            while (sum > target) sum -= primes[left++];
            if (sum == target) ++answer;
        }
        cout << answer << '\n';
    }
}
