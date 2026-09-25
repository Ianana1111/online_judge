#include <iomanip>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<long long> total(501, 0);
    for (int right = 2; right <= 500; ++right) {
        total[right] = total[right - 1];
        for (int left = 1; left < right; ++left) total[right] += gcd(left, right);
    }
    int n;
    while (cin >> n && n != 0) cout << total[n] << '\n';
}
