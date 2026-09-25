#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<pair<long long, long long>> forward, backward;
        for (int i = 0; i < n; ++i) {
            long long a, b; cin >> a >> b;
            forward.push_back({a, b}); backward.push_back({b, a});
        }
        sort(forward.begin(), forward.end()); sort(backward.begin(), backward.end());
        cout << (forward == backward ? "YES" : "NO") << '\n';
    }
}
