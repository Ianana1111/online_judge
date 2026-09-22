#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int count, mod;
    while (cin >> count >> mod) {
        cout << count << ' ' << mod << '\n';
        if (count == 0 && mod == 0) break;
        vector<long long> values(count);
        for (auto& value : values) cin >> value;
        sort(values.begin(), values.end(), [mod](long long a, long long b) {
            long long ra = a % mod, rb = b % mod;
            if (ra != rb) return ra < rb;
            bool oddA = a % 2 != 0, oddB = b % 2 != 0;
            if (oddA != oddB) return oddA;
            if (oddA) return a > b;
            return a < b;
        });
        for (auto value : values) cout << value << '\n';
    }
}
