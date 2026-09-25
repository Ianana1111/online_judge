#include <iomanip>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 1000000; vector<bool> prime(limit, true); prime[0] = prime[1] = false;
    for (int p = 2; p * p < limit; ++p) if (prime[p]) for (int multiple = p * p; multiple < limit; multiple += p) prime[multiple] = false;
    vector<int> prefix(limit, 0);
    for (int value = 1; value < limit; ++value) {
        int digitSum = 0; for (int rest = value; rest; rest /= 10) digitSum += rest % 10;
        prefix[value] = prefix[value - 1];
        if (prime[value] && prime[digitSum]) ++prefix[value];
    }
    int queries; cin >> queries;
    while (queries--) { int left, right; cin >> left >> right; cout << prefix[right] - prefix[left - 1] << '\n'; }
}
