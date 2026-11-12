#include <algorithm>
#include <functional>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int cases;
    if (!(cin >> cases)) return 0;
    while (cases--) {
        int n;
        cin >> n;
        vector<int> count(n, 0);
        char ch;
        while (cin >> ch && ch != '#')
            if (ch >= 'A' && ch < 'A' + n) ++count[ch - 'A'];
        vector<int> sorted = count;
        sort(sorted.begin(), sorted.end(), greater<int>());
        vector<bool> used(n, false);
        auto take = [&](int a, int b) {
            for (int w = 0; w < n; ++w)
                if (!used[w] && (count[w] == a || count[w] == b)) { used[w] = true; return w; }
            return -1;
        };
        vector<int> order(n), rightNeed(n / 2);
        for (int k = 0; k < n / 2; ++k) {
            int a = sorted[2 * k], b = sorted[2 * k + 1];
            int w = take(a, b);
            order[k] = w;
            rightNeed[k] = count[w] == a ? b : a;
        }
        if (n % 2 == 1) order[n / 2] = take(sorted[n - 1], sorted[n - 1]);
        for (int k = n / 2 - 1; k >= 0; --k) order[n - 1 - k] = take(rightNeed[k], rightNeed[k]);
        for (int i = 0; i < n; ++i) cout << char('A' + order[i]) << (i + 1 == n ? '\n' : ' ');
        for (int i = 0; i < n; ++i) cout << count[order[i]] << (i + 1 == n ? '\n' : ' ');
    }
}
