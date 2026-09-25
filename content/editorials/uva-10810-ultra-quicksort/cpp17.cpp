#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<int> a(n); for (int &x : a) cin >> x;
        vector<int> sorted = a; sort(sorted.begin(), sorted.end());
        vector<int> tree(n + 1, 0);
        auto prefix = [&](int pos) { int result = 0; for (; pos > 0; pos -= pos & -pos) result += tree[pos]; return result; };
        long long inversions = 0;
        for (int i = 0; i < n; ++i) {
            int rank = lower_bound(sorted.begin(), sorted.end(), a[i]) - sorted.begin() + 1;
            inversions += i - prefix(rank);
            for (int pos = rank; pos <= n; pos += pos & -pos) ++tree[pos];
        }
        cout << inversions << '\n';
    }
}
