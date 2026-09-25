#include <iostream>
#include <set>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, tc = 0;
    while (cin >> n) {
        vector<long long> a(n);
        for (auto& value : a) cin >> value;
        bool good = true;
        for (int i = 0; i < n; ++i)
            if (a[i] < 1 || (i > 0 && a[i] <= a[i-1])) good = false;
        set<long long> sums;
        for (int i = 0; i < n; ++i) for (int j = i; j < n; ++j)
            if (!sums.insert(a[i] + a[j]).second) good = false;
        cout << "Case #" << ++tc << ": It is " << (good ? "" : "not ") << "a B2-Sequence.\n\n";
    }
}
